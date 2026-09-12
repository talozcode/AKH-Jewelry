"use server";

import { headers } from "next/headers";
import { stripeClient } from "../stripe";
import { getProductById } from "../products";
import { buildCartCheckoutParams, checkCartPurchasable, type CheckoutLine } from "../checkoutParams";

export type CartLineInput = { productId: string; size?: string; quantity: number };

/**
 * Public action, no admin gate. Called both from the cart page's
 * "Checkout" button (however many lines are in the persisted cart, see
 * lib/cart/store.ts) and from PurchaseArea.tsx's "Buy Now" button (a
 * single-line array, bypassing the persisted cart entirely - "Buy Now"
 * means "just this piece," not "also whatever else happens to be sitting
 * in the cart"). Returns the Checkout Session URL rather than calling
 * redirect() directly, so the caller (a client component using the
 * standard { ok, ... } action-result pattern) can show a real error
 * inline instead of forcing a hard navigation on failure.
 *
 * Every line is re-validated and re-priced from the database here, never
 * trusted from the client: `lines` only carries product ids, sizes and
 * quantities, not prices - a tampered/direct call can't influence what's
 * actually charged.
 */
export async function createCartCheckoutSession(lines: CartLineInput[]): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (lines.length === 0) return { ok: false, error: "Your cart is empty." };

  // Two cart lines for the same product+size (a genuinely reachable case:
  // a stale client-side merge, or a direct call) collapse into one before
  // validation/building, so stock and quantity limits are checked against
  // the real combined amount rather than under-counting across split lines.
  const merged = new Map<string, CartLineInput>();
  for (const line of lines) {
    const key = `${line.productId}::${line.size ?? ""}`;
    const existing = merged.get(key);
    merged.set(key, existing ? { ...existing, quantity: existing.quantity + line.quantity } : line);
  }
  const mergedLines = [...merged.values()];

  // getProductById is inside this try/catch (not run ahead of it): a
  // malformed/non-UUID productId - reachable since this is a directly
  // callable Server Action, not just whatever the UI happens to send -
  // makes the underlying Supabase query throw, and that needs the same
  // friendly, inline "please try again" result as a Stripe failure below,
  // not an unhandled exception (this app has no error boundary anywhere).
  try {
    const products = await Promise.all(mergedLines.map((line) => getProductById(line.productId)));

    const purchasable = checkCartPurchasable(
      mergedLines.map((line, i) => ({ product: products[i], size: line.size, quantity: line.quantity }))
    );
    if (!purchasable.ok) return purchasable;

    const headerList = await headers();
    const host = headerList.get("host");
    const protocol = host?.startsWith("localhost") ? "http" : "https";
    const origin = `${protocol}://${host}`;

    const stripe = await stripeClient();
    // Non-null: checkCartPurchasable's ok:true branch above already
    // implies every product in `products` is defined (it's the first
    // thing checkPurchasable checks per line).
    const checkoutLines: CheckoutLine[] = mergedLines.map((line, i) => ({
      product: products[i]!,
      size: line.size,
      quantity: line.quantity,
    }));
    const session = await stripe.checkout.sessions.create(buildCartCheckoutParams(checkoutLines, origin));

    if (!session.url) return { ok: false, error: "Could not start checkout. Please try again." };
    return { ok: true, url: session.url };
  } catch (err) {
    console.error("createCartCheckoutSession failed:", err);
    return { ok: false, error: "Could not start checkout. Please try again." };
  }
}
