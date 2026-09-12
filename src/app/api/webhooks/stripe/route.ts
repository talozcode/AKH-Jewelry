import { stripeClient } from "@/lib/stripe";
import { resolveStripeWebhookSecret } from "@/lib/stripeSettings";
import { decideInventoryEffect, getProductById, setProductAvailability } from "@/lib/products";
import {
  getOrderByPaymentIntentId,
  isDuplicateSessionError,
  markOrderItemOversold,
  refundOrder,
  sessionToOrderRow,
  setOrderDisputeStatus,
  type NewOrderItemRow,
} from "@/lib/db/orders";
import { supabaseAdmin } from "@/lib/supabase/server";
import { ownerEmailAddress, sendEmail } from "@/lib/email/send";
import { orderConfirmationEmail, ownerDisputeAlertEmail, ownerErrorAlertEmail, ownerNewOrderAlertEmail, refundConfirmationEmail } from "@/lib/email/templates";
import type Stripe from "stripe";

// This repo's first API Route Handler. Runs on the default Node runtime
// (not Edge) - Stripe's SDK needs Node's crypto for signature
// verification.

// Domain cutover to akhjewelry.com hasn't happened yet as of this writing
// (see CLAUDE.md's launch checklist) - this is the site's real current
// address, used only for links inside owner alert emails.
const ADMIN_ORDERS_URL = `${process.env.SITE_URL || "https://akh-jewelry.vercel.app"}/admin/orders`;

/**
 * Closes the "no error alerting anywhere" gap: a failure in any of this
 * route's catch blocks used to only ever reach Vercel's server logs - a
 * surface the owner has no account/reason to know exists. Best-effort:
 * wrapped in its own try/catch so a failed alert email can never turn an
 * already-handled error into an unhandled one, and never sent if
 * OWNER_EMAIL/RESEND_API_KEY aren't configured (sendEmail no-ops then).
 */
async function alertOwnerOfError(context: string, err: unknown) {
  const ownerEmail = ownerEmailAddress();
  if (!ownerEmail) return;
  try {
    const detail = err instanceof Error ? err.message : String(err);
    await sendEmail({ to: ownerEmail, ...ownerErrorAlertEmail({ context, detail }) });
  } catch (alertErr) {
    console.error("stripe webhook: failed to send owner error alert", alertErr);
  }
}

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

  // Every handler below is safe for Stripe to retry: checkout.session.
  // completed's real DB write is guarded by a unique constraint on
  // session id (a retry hits isDuplicateSessionError and no-ops), and
  // refund/dispute writes are plain idempotent overwrites (refundOrder's
  // own atomic conditional update, setOrderDisputeStatus just re-setting
  // the same values). So an unexpected exception here - a transient
  // Supabase blip, not one of the already-handled early-return cases
  // (duplicate event, deleted product, no line items) - is deliberately
  // let through to a 500 rather than swallowed into 200: Stripe's
  // automatic retry (up to 3 days) is the actual recovery mechanism for
  // a real transient failure, and only a 500 makes it retry at all. This
  // was previously a real gap: EVERY branch always returned 200
  // regardless of what happened inside, so a transient failure was
  // silently unrecoverable - Stripe never got a reason to try again, and
  // the only other signal (an owner alert email) doesn't do anything
  // until a Resend account is configured. alertOwnerOfError still fires
  // either way, best-effort, before the error propagates.
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      await handleCheckoutCompleted(session);
    } catch (err) {
      console.error("stripe webhook: checkout.session.completed handling failed", err);
      await alertOwnerOfError("checkout.session.completed", err);
      throw err;
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
      await alertOwnerOfError(event.type, err);
      throw err;
    }
  }

  // A chargeback was previously invisible in this app entirely - only
  // visible by logging into the Stripe Dashboard directly, with nothing
  // reminding the owner it's happening or that Stripe's evidence deadline
  // is time-boxed (a missed deadline is an automatic loss). Only
  // `.created` triggers the alert email - `.updated`/`.closed` just keep
  // the stored status current without re-emailing on every status ping.
  if (event.type === "charge.dispute.created" || event.type === "charge.dispute.updated" || event.type === "charge.dispute.closed") {
    const dispute = event.data.object as Stripe.Dispute;
    try {
      await handleDisputeEvent(event.type, dispute);
    } catch (err) {
      console.error(`stripe webhook: ${event.type} handling failed`, err);
      await alertOwnerOfError(event.type, err);
      throw err;
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
  if (order.stripe_refund_id === refund.id) return; // fast-path: already recorded per this handler's own earlier read

  // The actual guard against a duplicate email is refundOrder's own
  // atomic conditional update (see its doc comment) - the check above is
  // just a fast path to skip the write entirely on an obvious replay.
  // Without the atomic version, this read-then-compare pattern (checking
  // `order.stripe_refund_id` from a read taken moments ago) can't detect
  // a genuine cross-request race against refundOrderAction (the in-app
  // button), which can land its own write in the gap between that read
  // and this one.
  const didWrite = await refundOrder(order.id, { stripeRefundId: refund.id, amountRefunded: refund.amount });
  if (!didWrite) return; // refundOrderAction won the race and already sent its own confirmation email

  if (order.customer_email) {
    await sendEmail({
      to: order.customer_email,
      ...refundConfirmationEmail({ customerName: order.customer_name, amountRefunded: refund.amount, currency: order.currency }),
    });
  }
}

async function handleDisputeEvent(eventType: string, dispute: Stripe.Dispute) {
  const paymentIntentId = typeof dispute.payment_intent === "string" ? dispute.payment_intent : dispute.payment_intent?.id;
  if (!paymentIntentId) {
    console.error("stripe webhook: dispute event has no payment_intent", dispute.id);
    return;
  }

  const order = await getOrderByPaymentIntentId(paymentIntentId);
  if (!order) return; // a dispute on a charge this app doesn't know about

  // Stripe explicitly expects webhook handlers to tolerate at-least-once
  // redelivery of the same event. setOrderDisputeStatus is safely
  // idempotent on its own (just re-writes the same values), but without
  // this guard a redelivered charge.dispute.created would re-send the
  // owner alert email every time - a real, different case from the
  // .updated/.closed de-dup already handled below by only alerting on
  // .created in the first place. Mirrors the equivalent guard in
  // handleRefundEvent.
  const alreadyRecorded = order.stripe_dispute_id === dispute.id;

  await setOrderDisputeStatus(order.id, dispute.id, dispute.status);

  if (eventType === "charge.dispute.created" && !alreadyRecorded) {
    const ownerEmail = ownerEmailAddress();
    if (ownerEmail) {
      await sendEmail({
        to: ownerEmail,
        ...ownerDisputeAlertEmail({
          customerName: order.customer_name,
          amount: dispute.amount,
          currency: dispute.currency.toUpperCase(),
          adminOrdersUrl: ADMIN_ORDERS_URL,
        }),
      });
    }
  }
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

  const orderRow = sessionToOrderRow(session);
  const { data: insertedOrder, error } = await supabaseAdmin().from("orders").insert(orderRow).select("id").single();

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
      // reuses the exact same race-safe primitive unchanged. The loop runs
      // for every unit in `item.quantity`, even after stock hits 0 or a
      // decrement fails - an EARLIER version stopped (`break`) the instant
      // it saw newQty===0, which silently under-reported a partial
      // oversell: buying quantity=3 against 2 in stock would decrement 2,
      // correctly flip the product to Out of Stock, then exit before ever
      // attempting the 3rd unit, so oversold was never set even though the
      // customer paid for a piece that doesn't exist. Continuing the loop
      // means that 3rd iteration's RPC call correctly returns null (stock
      // is already 0) and the shortfall gets flagged like any other
      // oversell.
      let oversold = false;
      let flippedToOutOfStock = false;
      for (let i = 0; i < item.quantity; i++) {
        const { data: newQty, error: rpcError } = await supabaseAdmin().rpc("decrement_product_stock", {
          p_product_id: product.id!,
        });
        if (rpcError) throw new Error(`decrement_product_stock failed: ${rpcError.message}`);

        if (newQty === null) {
          oversold = true;
          continue;
        }
        if (newQty === 0 && !flippedToOutOfStock) {
          await setProductAvailability(product.id!, "Out of Stock");
          flippedToOutOfStock = true;
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

  // Emails last, after everything else succeeded: a failed send here
  // (e.g. no Resend account configured yet) must never roll back or
  // re-throw past the order/inventory work that already happened -
  // sendEmail() itself never throws, it returns { ok: false } and logs.
  const emailItems = itemRows.map((row) => ({ name: row.product_name, size: row.size, quantity: row.quantity ?? 1 }));
  if (orderRow.customer_email) {
    await sendEmail({
      to: orderRow.customer_email,
      ...orderConfirmationEmail({
        customerName: orderRow.customer_name,
        items: emailItems,
        amountTotal: orderRow.amount_total,
        currency: orderRow.currency,
        specialInstructions: orderRow.special_instructions ?? null,
      }),
    });
  }
  const ownerEmail = ownerEmailAddress();
  if (ownerEmail) {
    await sendEmail({
      to: ownerEmail,
      ...ownerNewOrderAlertEmail({
        customerName: orderRow.customer_name,
        items: emailItems,
        amountTotal: orderRow.amount_total,
        currency: orderRow.currency,
        adminOrdersUrl: ADMIN_ORDERS_URL,
      }),
    });
  }
}
