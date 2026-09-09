import Stripe from "stripe";

/**
 * Server-only Stripe client. Never import this from a Client Component —
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
 */
export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set. Add it to .env.local (see CLAUDE.md's Checkout section).");
  }
  return new Stripe(key);
}
