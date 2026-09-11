"use server";

import { headers } from "next/headers";
import { stripeClient } from "../stripe";
import { getProductById } from "../products";
import { buildCheckoutParams, checkPurchasable } from "../checkoutParams";

/**
 * Public action, called from PurchaseArea.tsx's "Buy Now" button, no
 * admin gate. Builds a hosted Stripe Checkout Session for exactly one
 * product (+ optional size) and returns its URL rather than calling
 * redirect() directly, so the caller (a client component using the
 * standard { ok, ... } action-result pattern) can show a real error
 * inline instead of forcing a hard navigation on failure.
 */
export async function createCheckoutSession(
  productId: string,
  size?: string
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const product = await getProductById(productId);
  const purchasable = checkPurchasable(product);
  if (!purchasable.ok) return purchasable;

  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  try {
    const stripe = stripeClient();
    // Non-null: checkPurchasable's ok:true branch above already implies
    // product is defined (it's the first thing that function checks).
    const session = await stripe.checkout.sessions.create(buildCheckoutParams(product!, size, origin));

    if (!session.url) return { ok: false, error: "Could not start checkout. Please try again." };
    return { ok: true, url: session.url };
  } catch (err) {
    console.error("createCheckoutSession failed:", err);
    return { ok: false, error: "Could not start checkout. Please try again." };
  }
}
