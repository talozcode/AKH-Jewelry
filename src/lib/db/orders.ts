import { supabaseAdmin } from "../supabase/server";
import type { Database } from "../supabase/database.types";

export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderStatus = Order["status"];

/**
 * The subset of statuses `updateOrderStatus` will accept. `refunded` is
 * deliberately excluded at the type level: it's only ever reached through
 * `refundOrder` below (which requires an actual Stripe refund id), so a
 * future caller can't set it from a plain status dropdown with no money
 * having moved. See `updateOrderStatusAction` in admin/orders/actions.ts
 * for the runtime half of this guard.
 */
export type SettableOrderStatus = Exclude<OrderStatus, "refunded">;

export async function getOrders(filters?: { status?: OrderStatus }): Promise<Order[]> {
  let query = supabaseAdmin().from("orders").select("*").order("created_at", { ascending: false });
  if (filters?.status) query = query.eq("status", filters.status);
  const { data, error } = await query;
  if (error) throw new Error(`getOrders: ${error.message}`);
  return data ?? [];
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const { data, error } = await supabaseAdmin().from("orders").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`getOrderById: ${error.message}`);
  return data ?? undefined;
}

/** Find the order a refund/dispute event is about, by Stripe payment intent. */
export async function getOrderByPaymentIntentId(paymentIntentId: string): Promise<Order | undefined> {
  const { data, error } = await supabaseAdmin().from("orders").select("*").eq("stripe_payment_intent_id", paymentIntentId).maybeSingle();
  if (error) throw new Error(`getOrderByPaymentIntentId: ${error.message}`);
  return data ?? undefined;
}

export async function getOrderCountsByStatus(): Promise<Record<OrderStatus, number>> {
  const { data, error } = await supabaseAdmin().from("orders").select("status");
  if (error) throw new Error(`getOrderCountsByStatus: ${error.message}`);
  const counts: Record<OrderStatus, number> = { unfulfilled: 0, shipped: 0, refunded: 0 };
  for (const row of data ?? []) counts[row.status]++;
  return counts;
}

/**
 * Sum of amount_total minus amount_refunded (Stripe's smallest-currency-unit
 * amounts), grouped by currency - never summed across currencies, since ₪
 * and $ aren't the same unit. Most orders are expected to be ILS; a second
 * currency just shows as its own line rather than silently distorting one
 * total. Subtracting amount_refunded here is the only place refunds affect
 * "revenue": a refunded order otherwise stays a normal row (see
 * getOrderCountsByStatus's separate `refunded` bucket for order counts).
 */
export async function getRevenueByCurrency(): Promise<Record<string, number>> {
  const { data, error } = await supabaseAdmin().from("orders").select("amount_total, amount_refunded, currency");
  if (error) throw new Error(`getRevenueByCurrency: ${error.message}`);
  const totals: Record<string, number> = {};
  for (const row of data ?? []) totals[row.currency] = (totals[row.currency] ?? 0) + (row.amount_total - row.amount_refunded);
  return totals;
}

/**
 * Flags an order whose tracked-inventory decrement returned null: the
 * customer already paid by the time this runs, so the webhook must never
 * throw here, only record it for the owner to see on `/admin/orders`.
 */
export async function markOrderOversold(id: string): Promise<void> {
  const { error } = await supabaseAdmin().from("orders").update({ oversold: true }).eq("id", id);
  if (error) throw new Error(`markOrderOversold: ${error.message}`);
}

/** Admin only - call `requireAdminAction()` before this. */
export async function updateOrderStatus(id: string, status: SettableOrderStatus): Promise<void> {
  const { error } = await supabaseAdmin().from("orders").update({ status }).eq("id", id);
  if (error) throw new Error(`updateOrderStatus: ${error.message}`);
}

/**
 * The only path that can set status to 'refunded'. Callers (the refund
 * Server Action, and the webhook's refund.updated handler for refunds
 * issued directly from the Stripe Dashboard) must already have a real
 * Stripe refund id and amount in hand before calling this - it's a pure
 * DB write, not where the actual Stripe API call happens.
 */
export async function refundOrder(id: string, refund: { stripeRefundId: string; amountRefunded: number }): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("orders")
    .update({
      status: "refunded",
      stripe_refund_id: refund.stripeRefundId,
      refunded_at: new Date().toISOString(),
      amount_refunded: refund.amountRefunded,
    })
    .eq("id", id);
  if (error) throw new Error(`refundOrder: ${error.message}`);
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
