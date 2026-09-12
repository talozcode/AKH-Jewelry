import { stripeClient } from "@/lib/stripe";
import { resolveStripeWebhookSecret } from "@/lib/stripeSettings";
import { decideInventoryEffect, getProductById, setProductAvailability } from "@/lib/products";
import {
  getOrderByPaymentIntentId,
  isDuplicateSessionError,
  markOrderItemOversold,
  refundOrder,
  sessionToOrderRow,
  type NewOrderItemRow,
} from "@/lib/db/orders";
import { supabaseAdmin } from "@/lib/supabase/server";
import type Stripe from "stripe";

// This repo's first API Route Handler. Runs on the default Node runtime
// (not Edge) - Stripe's SDK needs Node's crypto for signature
// verification.

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    console.error("stripe webhook: missing signature header");
    return new Response("Webhook not configured", { status: 400 });
  }

  // Checked before reading the body (cheap, no DB round-trip) so a request
  // with no signature at all never even touches the credentials lookup.
  const secret = await resolveStripeWebhookSecret();
  if (!secret) {
    // Fails closed: a config problem, not a Stripe-retry-worthy transient
    // failure. 400 so it's visible in the Stripe Dashboard's webhook
    // attempt log rather than silently 200'ing forever.
    console.error("stripe webhook: no webhook secret configured (admin settings or STRIPE_WEBHOOK_SECRET)");
    return new Response("Webhook not configured", { status: 400 });
  }

  // MUST read the raw text body, never req.json() first - signature
  // verification needs the exact byte string Stripe signed.
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    const stripe = await stripeClient();
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error("stripe webhook: signature verification failed", err);
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      await handleCheckoutCompleted(session);
    } catch (err) {
      // Judgment call: log and still 200 for errors a Stripe retry can't
      // fix (deleted product, a duplicate event already recorded) - a
      // retry would just fail the same way and eventually cause Stripe to
      // disable the endpoint. Only a genuinely transient failure should
      // bubble past this into a 500 so Stripe retries it.
      console.error("stripe webhook: checkout.session.completed handling failed", err);
    }
  }

  // Since Stripe's October 2024 webhook update, refund.created/updated/
  // failed fire uniformly for every refund type (previously a synchronous
  // card refund only ever fired charge.refunded). Listening to all three
  // here, not just charge.refunded, is what makes this catch refunds
  // issued directly from the Stripe Dashboard - refundOrderAction (the
  // in-app refund button) already writes the DB itself, so for THAT path
  // this is a no-op confirmation, not the only place the write happens.
  if (event.type === "refund.created" || event.type === "refund.updated" || event.type === "refund.failed") {
    const refund = event.data.object as Stripe.Refund;
    try {
      await handleRefundEvent(event.type, refund);
    } catch (err) {
      console.error(`stripe webhook: ${event.type} handling failed`, err);
    }
  }

  return new Response("ok", { status: 200 });
}

async function handleRefundEvent(eventType: string, refund: Stripe.Refund) {
  const paymentIntentId = typeof refund.payment_intent === "string" ? refund.payment_intent : refund.payment_intent?.id;
  if (!paymentIntentId) {
    console.error("stripe webhook: refund event has no payment_intent", refund.id);
    return;
  }

  const order = await getOrderByPaymentIntentId(paymentIntentId);
  if (!order) {
    // A refund on a charge this app doesn't know about (e.g. a test refund
    // on an unrelated PaymentIntent). Not an error.
    return;
  }

  if (eventType === "refund.failed") {
    // Card refunds (this shop's only real payment method today) complete
    // synchronously, so refundOrderAction never marks an order refunded
    // before Stripe confirms success - a failure reaching this order after
    // that would mean Stripe reversed its own earlier success, which is
    // exceptional enough to just log loudly for manual reconciliation
    // rather than guess at reverting the order's status automatically.
    console.error("stripe webhook: refund FAILED for an order already believed refunded", order.id, refund.id);
    return;
  }

  if (refund.status !== "succeeded") return; // not final yet (e.g. a pending bank-transfer refund)
  if (order.stripe_refund_id === refund.id) return; // already recorded, idempotent no-op

  await refundOrder(order.id, { stripeRefundId: refund.id, amountRefunded: refund.amount });
}

/**
 * A Checkout Session's line items aren't included in the
 * `checkout.session.completed` event payload itself, so they're fetched
 * separately here. `productId`/`slug`/`size` come back on each line
 * item's own `metadata` because buildCartCheckoutParams() (checkoutParams.ts)
 * sets them on `price_data.product_data.metadata` at session-creation
 * time - Stripe copies that onto the resulting line item, no `expand`
 * needed to read it back.
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const stripe = await stripeClient();
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

  if (lineItems.data.length === 0) {
    console.error("stripe webhook: session has no line items", session.id);
    return;
  }

  const { data: insertedOrder, error } = await supabaseAdmin().from("orders").insert(sessionToOrderRow(session)).select("id").single();

  if (error) {
    if (isDuplicateSessionError(error)) {
      // A Stripe retry of an event already processed. Not an error, just a
      // no-op.
      return;
    }
    throw new Error(`orders insert failed: ${error.message}`);
  }

  const itemRows: NewOrderItemRow[] = [];
  for (const li of lineItems.data) {
    const productId = li.metadata?.productId || null;
    const size = li.metadata?.size || null;
    // Fetch fresh, never trust old metadata for the display name - if the
    // product's been deleted or renamed since checkout, this order should
    // still reflect what's true now, falling back to whatever Stripe
    // recorded (its line-item description, which defaults to the name
    // given at session-creation time) only if the product is gone
    // entirely. unit_amount comes from Stripe's own record of what was
    // actually charged, never re-derived from the product's current
    // price, which could have changed since.
    const product = productId ? await getProductById(productId) : undefined;
    itemRows.push({
      order_id: insertedOrder.id,
      product_id: productId,
      product_name: product?.name ?? li.description ?? "Unknown item",
      product_slug: product?.slug ?? li.metadata?.slug ?? "",
      unit_amount: li.price?.unit_amount ?? 0,
      size,
      quantity: li.quantity ?? 1,
    });
  }

  const { data: insertedItems, error: itemsError } = await supabaseAdmin()
    .from("order_items")
    .insert(itemRows)
    .select("id, product_id, quantity");
  if (itemsError) throw new Error(`order_items insert failed: ${itemsError.message}`);

  for (const item of insertedItems ?? []) {
    if (!item.product_id) continue; // product deleted/never resolved - order/item still recorded, just nothing to decrement

    const product = await getProductById(item.product_id);
    if (!product) {
      console.error("stripe webhook: product no longer exists", item.product_id, session.id);
      continue;
    }

    // See decideInventoryEffect's own doc comment for the full truth table.
    const effect = decideInventoryEffect(product);

    if (effect === "flip_to_out_of_stock") {
      // Untracked one-of-one: flip the instant payment confirms, so the
      // same physical piece can't be sold twice. setProductAvailability
      // (not updateProduct(id, {...product, availability})) so a
      // concurrent admin edit to this product isn't silently clobbered by
      // a stale full-row write.
      await setProductAvailability(product.id!, "Out of Stock");
    } else if (effect === "decrement") {
      // Tracked inventory: the existing atomic per-unit RPC, called once
      // per unit in this line (quantity > 1 is a new possibility with
      // multi-item carts) rather than widening the RPC to decrement by N -
      // reuses the exact same race-safe primitive unchanged. Stops at the
      // first failure/zero rather than looping past it: once stock hits 0
      // or oversells, further iterations for the same line would just
      // repeat the same outcome.
      let oversold = false;
      for (let i = 0; i < item.quantity; i++) {
        const { data: newQty, error: rpcError } = await supabaseAdmin().rpc("decrement_product_stock", {
          p_product_id: product.id!,
        });
        if (rpcError) throw new Error(`decrement_product_stock failed: ${rpcError.message}`);

        if (newQty === null) {
          oversold = true;
          break;
        }
        if (newQty === 0) {
          await setProductAvailability(product.id!, "Out of Stock");
          break;
        }
      }
      if (oversold) {
        // The customer already paid by the time this runs, so this must
        // never throw: log loudly and flag it for the owner on
        // /admin/orders rather than pretend nothing went wrong.
        console.error("stripe webhook: OVERSOLD", product.id, session.id);
        await markOrderItemOversold(item.id);
      }
    }
  }
}
