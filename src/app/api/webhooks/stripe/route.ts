import { stripeClient } from "@/lib/stripe";
import { getProductById, updateProduct } from "@/lib/products";
import { supabaseAdmin } from "@/lib/supabase/server";
import type Stripe from "stripe";

// This repo's first API Route Handler. Runs on the default Node runtime
// (not Edge) — Stripe's SDK needs Node's crypto for signature
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

  // MUST read the raw text body, never req.json() first — signature
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
      // fix (deleted product, a duplicate event already recorded) — a
      // retry would just fail the same way and eventually cause Stripe to
      // disable the endpoint. Only a genuinely transient failure should
      // bubble past this into a 500 so Stripe retries it.
      console.error("stripe webhook: checkout.session.completed handling failed", err);
    }
  }

  return new Response("ok", { status: 200 });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const productId = session.metadata?.productId;
  const size = session.metadata?.size || null;
  if (!productId) {
    console.error("stripe webhook: session missing productId metadata", session.id);
    return;
  }

  // Fetch the product fresh — never trust old metadata for price/name in
  // case it changed between checkout creation and payment confirmation.
  const product = await getProductById(productId);
  if (!product) {
    console.error("stripe webhook: product no longer exists", productId, session.id);
    return;
  }

  const customerName = session.customer_details?.name ?? "";
  const customerEmail = session.customer_details?.email ?? "";
  const shipping = session.collected_information?.shipping_details;

  const { error } = await supabaseAdmin()
    .from("orders")
    .insert({
      product_id: product.id,
      product_name: product.name,
      product_slug: product.slug,
      product_price: product.price,
      product_currency: product.currency,
      size,
      customer_name: customerName,
      customer_email: customerEmail,
      shipping_line1: shipping?.address.line1 ?? "",
      shipping_line2: shipping?.address.line2 ?? null,
      shipping_city: shipping?.address.city ?? "",
      shipping_state: shipping?.address.state ?? null,
      shipping_postal_code: shipping?.address.postal_code ?? "",
      shipping_country: shipping?.address.country ?? "",
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
      amount_total: session.amount_total ?? 0,
      currency: (session.currency ?? product.currency).toUpperCase(),
    });

  if (error) {
    if (error.code === "23505") {
      // unique_violation on stripe_checkout_session_id — a Stripe retry of
      // an event already processed. Not an error, just a no-op.
      return;
    }
    throw new Error(`orders insert failed: ${error.message}`);
  }

  // Decision: flip In Stock one-of-ones to Out of Stock the instant
  // payment confirms, so the same physical piece can't be sold twice.
  // Made to Order is untouched (no fixed inventory to protect).
  if (product.availability === "In Stock") {
    await updateProduct(product.id!, { ...product, availability: "Out of Stock" });
  }
}
