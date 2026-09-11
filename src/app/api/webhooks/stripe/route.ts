import { stripeClient } from "@/lib/stripe";
import { decideInventoryEffect, getProductById, setProductAvailability } from "@/lib/products";
import { getOrderByPaymentIntentId, isDuplicateSessionError, markOrderOversold, refundOrder, sessionToOrderRow } from "@/lib/db/orders";
import { supabaseAdmin } from "@/lib/supabase/server";
import type Stripe from "stripe";

// This repo's first API Route Handler. Runs on the default Node runtime
// (not Edge) - Stripe's SDK needs Node's crypto for signature
// verification.

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    // Fails closed: a config problem, not a Stripe-retry-worthy transient
    // failure. 400 so it's visible in the Stripe Dashboard's webhook
    // attempt log rather than silently 200'ing forever.
    console.error("stripe webhook: missing signature header or STRIPE_WEBHOOK_SECRET");
    return new Response("Webhook not configured", { status: 400 });
  }

  // MUST read the raw text body, never req.json() first - signature
  // verification needs the exact byte string Stripe signed.
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripeClient().webhooks.constructEvent(rawBody, signature, secret);
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

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const productId = session.metadata?.productId;
  const size = session.metadata?.size || null;
  if (!productId) {
    console.error("stripe webhook: session missing productId metadata", session.id);
    return;
  }

  // Fetch the product fresh - never trust old metadata for price/name in
  // case it changed between checkout creation and payment confirmation.
  const product = await getProductById(productId);
  if (!product) {
    console.error("stripe webhook: product no longer exists", productId, session.id);
    return;
  }

  const { data: insertedOrder, error } = await supabaseAdmin()
    .from("orders")
    .insert(sessionToOrderRow(session, product, size))
    .select("id")
    .single();

  if (error) {
    if (isDuplicateSessionError(error)) {
      // A Stripe retry of an event already processed. Not an error, just a
      // no-op.
      return;
    }
    throw new Error(`orders insert failed: ${error.message}`);
  }

  // See decideInventoryEffect's own doc comment for the full truth table.
  const effect = decideInventoryEffect(product);

  if (effect === "flip_to_out_of_stock") {
    // Untracked one-of-one: flip the instant payment confirms, so the same
    // physical piece can't be sold twice. setProductAvailability (not
    // updateProduct(id, {...product, availability})) so a concurrent admin
    // edit to this product isn't silently clobbered by a stale full-row
    // write.
    await setProductAvailability(product.id!, "Out of Stock");
  } else if (effect === "decrement") {
    // Tracked inventory: atomic per-unit decrement, not a read-then-write,
    // so two concurrent payments for the last unit can't both succeed (see
    // the migration's own comment for the concurrency argument in full).
    const { data: newQty, error: rpcError } = await supabaseAdmin().rpc("decrement_product_stock", {
      p_product_id: product.id!,
    });
    if (rpcError) throw new Error(`decrement_product_stock failed: ${rpcError.message}`);

    if (newQty === null) {
      // The customer already paid by the time this runs, so this must
      // never throw: log loudly and flag it for the owner on
      // /admin/orders rather than pretend nothing went wrong.
      console.error("stripe webhook: OVERSOLD", product.id, session.id);
      await markOrderOversold(insertedOrder.id);
    } else if (newQty === 0) {
      await setProductAvailability(product.id!, "Out of Stock");
    }
  }
}
