import Stripe from "stripe";
import { resolveStripeSecretKey } from "./stripeSettings";

/**
 * Server-only Stripe client. Never import this from a Client Component -
 * it belongs in Server Actions and Route Handlers only, same discipline as
 * supabaseAdmin() in src/lib/supabase/server.ts.
 *
 * Deliberately no @stripe/stripe-js anywhere in this app: checkout is a
 * pure hosted-Checkout-Session redirect (session.url), so Stripe.js never
 * needs to load in the browser.
 *
 * apiVersion is left to the installed package's own default rather than
 * hardcoded, so it always matches what this SDK version's TypeScript types
 * actually expect.
 *
 * Async because the key can now come from the database (see
 * stripeSettings.ts) - the owner's own Stripe key, if she's set one in
 * /admin/site-settings, takes priority over the developer-configured
 * STRIPE_SECRET_KEY environment variable.
 */
export async function stripeClient(): Promise<Stripe> {
  const key = await resolveStripeSecretKey();
  return new Stripe(key);
}

/** Loose shape check only, not real validation - Stripe itself is the
 *  actual authority on whether a key works. Used to reject an obvious typo
 *  or pasted-the-wrong-thing before ever writing it to the database. */
export function looksLikeStripeSecretKey(value: string): boolean {
  return /^(sk|rk)_(test|live)_[A-Za-z0-9]{10,}$/.test(value.trim());
}

export function looksLikeStripeWebhookSecret(value: string): boolean {
  return /^whsec_[A-Za-z0-9]{10,}$/.test(value.trim());
}
