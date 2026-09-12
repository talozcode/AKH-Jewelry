import { supabaseAdmin } from "../supabase/server";
import type { Database } from "../supabase/database.types";
import { SPECIAL_INSTRUCTIONS_FIELD_KEY } from "../checkoutParams";
import type Stripe from "stripe";

export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type OrderStatus = Order["status"];
export type NewOrderRow = Database["public"]["Tables"]["orders"]["Insert"];
export type NewOrderItemRow = Database["public"]["Tables"]["order_items"]["Insert"];

/**
 * An order together with the products/quantities/sizes bought in it -
 * introduced when checkout became multi-item (an order used to just BE a
 * single product row; now product detail lives in the child `order_items`
 * table, one row per distinct product+size line, see migration
 * 0012_order_items.sql). Everywhere that used to read `order.product_name`
 * etc. directly now reads `order.items`.
 */
export type OrderWithItems = Order & { items: OrderItem[] };

/**
 * The subset of statuses `updateOrderStatus` will accept. `refunded` is
 * deliberately excluded at the type level: it's only ever reached through
 * `refundOrder` below (which requires an actual Stripe refund id), so a
 * future caller can't set it from a plain status dropdown with no money
 * having moved. See `updateOrderStatusAction` in admin/orders/actions.ts
 * for the runtime half of this guard.
 */
export type SettableOrderStatus = Exclude<OrderStatus, "refunded">;

function csvField(value: string): string {
  // RFC 4180: quote a field if it contains a comma, quote, or newline;
  // double any quote inside it. Every field is quoted-if-needed
  // independently - safe for customer/product names/addresses, which are
  // free text and can contain any of those characters.
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

const CSV_COLUMNS = [
  "Date",
  "Order ID",
  "Product",
  "Size",
  "Quantity",
  "Customer name",
  "Customer email",
  "Item amount",
  "Order total",
  "Currency",
  "Refunded",
  "Status",
  "Oversold",
  "Shipping address",
  "City",
  "State",
  "Postal code",
  "Country",
] as const;

/**
 * Formats orders as CSV for the owner's own bookkeeping/tax filing - the
 * only export previously available was the GDPR data-subject export
 * (exportPersonalData in ./privacy.ts), scoped to one customer's email at
 * a time, not a general ledger. One row per order ITEM, not per order,
 * since a multi-item order needs its products broken out for real
 * inventory/accounting use - "Order total" repeats on every row of the
 * same order so a spreadsheet formula can still sum it correctly (summing
 * "Item amount" instead double-counts an order's shipping/rounding
 * remainder, since Stripe's amount_total isn't guaranteed to exactly equal
 * the sum of unit_amount * quantity once currency rounding is involved).
 */
export function ordersToCsv(orders: OrderWithItems[]): string {
  const rows: string[] = [];
  for (const o of orders) {
    const items = o.items.length > 0 ? o.items : [null];
    for (const item of items) {
      rows.push(
        [
          new Date(o.created_at).toISOString().slice(0, 10),
          o.id,
          item?.product_name ?? "",
          item?.size ?? "",
          item ? String(item.quantity) : "",
          o.customer_name,
          o.customer_email,
          item ? ((item.unit_amount * item.quantity) / 100).toFixed(2) : "",
          (o.amount_total / 100).toFixed(2),
          o.currency,
          (o.amount_refunded / 100).toFixed(2),
          o.status,
          item?.oversold ? "yes" : "",
          [o.shipping_line1, o.shipping_line2].filter(Boolean).join(", "),
          o.shipping_city,
          o.shipping_state ?? "",
          o.shipping_postal_code,
          o.shipping_country,
        ]
          .map(csvField)
          .join(",")
      );
    }
  }
  return [CSV_COLUMNS.join(","), ...rows].join("\n");
}

async function attachItems(orders: Order[]): Promise<OrderWithItems[]> {
  if (orders.length === 0) return [];
  const { data, error } = await supabaseAdmin()
    .from("order_items")
    .select("*")
    .in(
      "order_id",
      orders.map((o) => o.id)
    );
  if (error) throw new Error(`attachItems: ${error.message}`);
  const byOrderId = new Map<string, OrderItem[]>();
  for (const item of data ?? []) {
    const list = byOrderId.get(item.order_id) ?? [];
    list.push(item);
    byOrderId.set(item.order_id, list);
  }
  return orders.map((o) => ({ ...o, items: byOrderId.get(o.id) ?? [] }));
}

export async function getOrders(filters?: { status?: OrderStatus }): Promise<OrderWithItems[]> {
  let query = supabaseAdmin().from("orders").select("*").order("created_at", { ascending: false });
  if (filters?.status) query = query.eq("status", filters.status);
  const { data, error } = await query;
  if (error) throw new Error(`getOrders: ${error.message}`);
  return attachItems(data ?? []);
}

export async function getOrderById(id: string): Promise<OrderWithItems | undefined> {
  const { data, error } = await supabaseAdmin().from("orders").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`getOrderById: ${error.message}`);
  if (!data) return undefined;
  const [withItems] = await attachItems([data]);
  return withItems;
}

/** Find the order a refund/dispute event is about, by Stripe payment intent. */
export async function getOrderByPaymentIntentId(paymentIntentId: string): Promise<OrderWithItems | undefined> {
  const { data, error } = await supabaseAdmin().from("orders").select("*").eq("stripe_payment_intent_id", paymentIntentId).maybeSingle();
  if (error) throw new Error(`getOrderByPaymentIntentId: ${error.message}`);
  if (!data) return undefined;
  const [withItems] = await attachItems([data]);
  return withItems;
}

export async function getOrderCountsByStatus(): Promise<Record<OrderStatus, number>> {
  const { data, error } = await supabaseAdmin().from("orders").select("status");
  if (error) throw new Error(`getOrderCountsByStatus: ${error.message}`);
  const counts: Record<OrderStatus, number> = { unfulfilled: 0, shipped: 0, refunded: 0 };
  for (const row of data ?? []) counts[row.status]++;
  return counts;
}

/**
 * Count of order ITEMS flagged oversold (moved from an order-level flag,
 * see migration 0012_order_items.sql - a multi-item order can have one
 * line oversold and the rest fine). Used for the Dashboard banner -
 * previously this only ever showed as a badge on the individual order row
 * in /admin/orders, invisible unless the owner happened to read every row
 * closely. Rare (only fires on a genuine concurrent-buyer race for the
 * last tracked unit) but high-stakes when it happens (a customer paid for
 * a piece that doesn't exist), so it now surfaces on the page she opens by
 * default.
 */
export async function getOversoldCount(): Promise<number> {
  const { count, error } = await supabaseAdmin().from("order_items").select("id", { count: "exact", head: true }).eq("oversold", true);
  if (error) throw new Error(`getOversoldCount: ${error.message}`);
  return count ?? 0;
}

/**
 * Sum of amount_total minus amount_refunded (Stripe's smallest-currency-unit
 * amounts), grouped by currency - never summed across currencies, since ₪
 * and $ aren't the same unit. Most orders are expected to be ILS; a second
 * currency just shows as its own line rather than silently distorting one
 * total. Subtracting amount_refunded here is the only place refunds affect
 * "revenue": a refunded order otherwise stays a normal row (see
 * getOrderCountsByStatus's separate `refunded` bucket for order counts).
 * Unaffected by the move to multi-item orders: amount_total/amount_refunded/
 * currency all stay on the order header, one Checkout Session = one charge
 * regardless of how many line items it contains.
 */
export async function getRevenueByCurrency(): Promise<Record<string, number>> {
  const { data, error } = await supabaseAdmin().from("orders").select("amount_total, amount_refunded, currency");
  if (error) throw new Error(`getRevenueByCurrency: ${error.message}`);
  const totals: Record<string, number> = {};
  for (const row of data ?? []) totals[row.currency] = (totals[row.currency] ?? 0) + (row.amount_total - row.amount_refunded);
  return totals;
}

/**
 * Flags a specific order item whose tracked-inventory decrement returned
 * null: the customer already paid by the time this runs, so the webhook
 * must never throw here, only record it for the owner to see.
 */
export async function markOrderItemOversold(itemId: string): Promise<void> {
  const { error } = await supabaseAdmin().from("order_items").update({ oversold: true }).eq("id", itemId);
  if (error) throw new Error(`markOrderItemOversold: ${error.message}`);
}

/** Admin only - call `requireAdminAction()` before this. Either value can
 *  be cleared by passing null (e.g. to correct a typo), independent of
 *  the other. */
export async function setOrderTracking(id: string, tracking: { trackingNumber: string | null; carrier: string | null }): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("orders")
    .update({ tracking_number: tracking.trackingNumber, carrier: tracking.carrier })
    .eq("id", id);
  if (error) throw new Error(`setOrderTracking: ${error.message}`);
}

/** Called only from the Stripe webhook's dispute handlers - not a Server
 *  Action, no admin gate needed. */
export async function setOrderDisputeStatus(id: string, disputeId: string, status: string): Promise<void> {
  const { error } = await supabaseAdmin().from("orders").update({ stripe_dispute_id: disputeId, dispute_status: status }).eq("id", id);
  if (error) throw new Error(`setOrderDisputeStatus: ${error.message}`);
}

/** Admin only - call `requireAdminAction()` before this. */
export async function updateOrderStatus(id: string, status: SettableOrderStatus): Promise<void> {
  const { error } = await supabaseAdmin().from("orders").update({ status }).eq("id", id);
  if (error) throw new Error(`updateOrderStatus: ${error.message}`);
}

/**
 * The only path that can set status to 'refunded'. Callers (the refund
 * Server Action, and the webhook's refund.* handler for refunds issued
 * directly from the Stripe Dashboard) must already have a real Stripe
 * refund id and amount in hand before calling this - it's a pure DB
 * write, not where the actual Stripe API call happens.
 *
 * `.is("stripe_refund_id", null)` makes this an atomic
 * check-then-write: refundOrderAction (the in-app button) and this
 * webhook route are two independent request paths that can both reach
 * this function for the SAME refund (Stripe can fire refund.created the
 * instant the admin action's own stripe.refunds.create() call returns,
 * before that action's own DB write lands). A plain read-then-compare
 * guard isn't atomic across two separate requests; conditioning the
 * UPDATE itself on the column still being null is. Returns whether this
 * call actually wrote the row (false means some other caller already
 * had - the caller should skip sending its own confirmation email in
 * that case, since the other caller already sent one).
 */
export async function refundOrder(id: string, refund: { stripeRefundId: string; amountRefunded: number }): Promise<boolean> {
  const { data, error } = await supabaseAdmin()
    .from("orders")
    .update({
      status: "refunded",
      stripe_refund_id: refund.stripeRefundId,
      refunded_at: new Date().toISOString(),
      amount_refunded: refund.amountRefunded,
    })
    .eq("id", id)
    .is("stripe_refund_id", null)
    .select("id");
  if (error) throw new Error(`refundOrder: ${error.message}`);
  return (data?.length ?? 0) > 0;
}

/**
 * Pure guard shared by the refund Server Action (re-checked server-side,
 * since the UI's disabled button is only a nicety) and the UI (to decide
 * whether to show a refund button at all). `stripe_payment_intent_id` being
 * null is a genuinely reachable case, not defensive paranoia: the webhook
 * only ever sets it from `session.payment_intent`, which can be absent on
 * a session Stripe hasn't fully processed.
 */
export function canRefund(order: Pick<Order, "status" | "stripe_payment_intent_id">): { ok: true } | { ok: false; reason: string } {
  if (order.status === "refunded") return { ok: false, reason: "This order has already been refunded." };
  if (!order.stripe_payment_intent_id) {
    return { ok: false, reason: "This order has no Stripe payment intent; refund it directly in the Stripe Dashboard." };
  }
  return { ok: true };
}

/**
 * Pure mapping from a completed Checkout Session to the order HEADER row
 * the webhook inserts (customer, shipping, totals - no product detail,
 * that's built separately into `order_items` rows from Stripe's line
 * items, see the webhook route). Every shipping/customer field here is
 * NOT NULL on the `orders` table, so a missing value has to become `""`
 * (or `null` where the column allows it), never `undefined` - an
 * `undefined` value in a Supabase insert is dropped from the request body
 * entirely rather than sent as null, which would have silently violated a
 * NOT NULL constraint on a session missing shipping details (a live crash
 * waiting to happen, not a hypothetical: Stripe doesn't guarantee shipping
 * details are present on every completed session shape).
 */
export function sessionToOrderRow(
  session: Pick<
    Stripe.Checkout.Session,
    "id" | "payment_intent" | "customer_details" | "collected_information" | "amount_total" | "currency" | "custom_fields"
  >
): NewOrderRow {
  const shipping = session.collected_information?.shipping_details;
  // custom_fields is a plain field on the Session resource (unlike line
  // items, it needs no separate API call/expand to read) - see
  // checkoutParams.ts's SPECIAL_INSTRUCTIONS_FIELD_KEY and
  // buildCartCheckoutParams for where this is collected.
  const giftNote = session.custom_fields?.find((f) => f.key === SPECIAL_INSTRUCTIONS_FIELD_KEY)?.text?.value;
  return {
    customer_name: session.customer_details?.name ?? "",
    customer_email: session.customer_details?.email ?? "",
    shipping_line1: shipping?.address.line1 ?? "",
    shipping_line2: shipping?.address.line2 ?? null,
    shipping_city: shipping?.address.city ?? "",
    shipping_state: shipping?.address.state ?? null,
    shipping_postal_code: shipping?.address.postal_code ?? "",
    shipping_country: shipping?.address.country ?? "",
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
    amount_total: session.amount_total ?? 0,
    currency: (session.currency ?? "ils").toUpperCase(),
    special_instructions: giftNote || null,
  };
}

/**
 * The webhook's sole idempotency guard against Stripe retrying an event
 * it's already processed: a unique_violation on stripe_checkout_session_id
 * means this exact order was already inserted, so it's a no-op, not an
 * error to surface or retry.
 */
export function isDuplicateSessionError(error: { code?: string } | null | undefined): boolean {
  return error?.code === "23505";
}
