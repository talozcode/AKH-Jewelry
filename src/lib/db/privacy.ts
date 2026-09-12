import { supabaseAdmin } from "../supabase/server";
import { getOrders, type Order, type OrderWithItems } from "./orders";

/**
 * Backs the data-rights promises in the Privacy Policy (access, export,
 * erasure) across GDPR, CCPA and Israeli PPL. `orders` is currently the
 * only table holding customer personal data (see CLAUDE.md's CMS section:
 * reservations, the other candidate, was deleted entirely).
 *
 * Case-insensitive lookup deliberately does NOT use Postgres ILIKE, even
 * though this file's migration (0006_order_privacy.sql) added an index on
 * `lower(customer_email)` for exactly this. ILIKE treats `_` as a
 * single-character wildcard, and real email addresses commonly contain a
 * literal underscore (e.g. "jane_doe@example.com"), which would make an
 * exact-lookup tool for someone's own data occasionally return a stranger's
 * order too, an over-matching bug that's a real disclosure risk in this
 * exact tool. There's no Postgres function/RPC in this codebase yet to
 * express `lower(col) = lower($1)` through supabase-js's query builder
 * (that's deliberately deferred to a later stage's inventory work), so this
 * fetches the (currently small) orders table and compares case-insensitively
 * in application code instead, which has no wildcard ambiguity. The index
 * stays in place as a straightforward win once this ever needs to move to a
 * real SQL-level equality filter.
 */

export type PersonalDataSummary = {
  email: string;
  orders: OrderWithItems[];
};

function matchesEmail(order: Order, email: string): boolean {
  return order.customer_email.trim().toLowerCase() === email.trim().toLowerCase();
}

/** Every order (anonymized or not) tied to this email, most recent first,
 *  each with its line items attached - what she bought is part of what
 *  the Privacy Policy promises to show/export, not just the order
 *  metadata around it. */
export async function findPersonalDataByEmail(email: string): Promise<PersonalDataSummary> {
  const allOrders = await getOrders();
  return { email, orders: allOrders.filter((order) => matchesEmail(order, email)) };
}

/** GDPR Art. 20-style structured export: JSON, not CSV, since order shape isn't flat. */
export async function exportPersonalData(email: string): Promise<{ email: string; exportedAt: string; orders: OrderWithItems[] }> {
  const summary = await findPersonalDataByEmail(email);
  return { email, exportedAt: new Date().toISOString(), orders: summary.orders };
}

/**
 * The columns this patch touches, erased in place. `special_instructions`
 * (the optional gift note/engraving request collected at checkout, added
 * after this tooling was first built) is included here because a customer
 * can and does write genuine personal information into free text there
 * (e.g. "for my mother Sarah, her birthday is..."); a QA audit found it had
 * been left out since the "Order extras" work shipped, which meant
 * "Erase permanently" didn't actually erase it despite the on-screen copy
 * in PrivacyLookupForm implying a full identity/contact erasure.
 *
 * Deliberately still NOT touched, with reasoning (not oversight): product/
 * price/currency/size/amount/status/timestamps (the financial/tax record
 * this data is retained for, not personal data once identity/contact are
 * gone); shipping_country (kept for VAT/customs record-keeping, see the
 * Privacy Policy's retention section); the Stripe IDs (already documented
 * pseudonymization caveat - Stripe retains its own copy regardless);
 * tracking_number/carrier (the shop's own record of what it shipped and
 * how, useful for post-erasure delivery recourse, and not meaningfully
 * "about" the customer once name/address are gone - the same logic as
 * shipping_country); stripe_dispute_id/dispute_status (the shop's
 * financial dispute-handling record, same rationale as the other Stripe
 * IDs above).
 *
 * A row that's already anonymized (`anonymized_at` set) is left alone by
 * `anonymizeOrdersByEmail` below rather than re-patched, but this function
 * itself is unconditional: given any order, it always returns what a fully
 * anonymized version of it looks like, which is what makes it a clean unit
 * to test against an explicit allowlist of preserved columns (see
 * privacy.test.ts) - the single test most likely to catch a future
 * personal-data column silently missing this list.
 */
export type AnonymizedOrderPatch = Pick<
  Order,
  | "customer_name"
  | "customer_email"
  | "shipping_line1"
  | "shipping_line2"
  | "shipping_city"
  | "shipping_state"
  | "shipping_postal_code"
  | "special_instructions"
  | "anonymized_at"
>;

export function buildAnonymizedOrderPatch(
  order: Pick<Order, "id" | "shipping_line2" | "shipping_state" | "special_instructions">
): AnonymizedOrderPatch {
  // NOT NULL columns always get the placeholder; nullable columns keep
  // null when there was nothing to erase in the first place (a blank
  // apartment-number field shouldn't read as "we erased something here").
  const eraseIfPresent = (value: string | null): string | null => (value === null ? null : "[erased]");

  return {
    customer_name: "[erased]",
    // Per-row unique, non-routable (RFC 2606 reserved .invalid TLD) rather
    // than one shared erased address for every anonymized row: customer_email
    // isn't unique-constrained in the schema, but a shared value would still
    // make the new lower(customer_email) index far less useful, and a stray
    // future unique constraint would break on the second erasure otherwise.
    customer_email: `erased+${order.id.slice(0, 8)}@akhjewelry.invalid`,
    shipping_line1: "[erased]",
    shipping_line2: eraseIfPresent(order.shipping_line2),
    shipping_city: "[erased]",
    shipping_state: eraseIfPresent(order.shipping_state),
    shipping_postal_code: "[erased]",
    special_instructions: eraseIfPresent(order.special_instructions),
    anonymized_at: new Date().toISOString(),
  };
}

/**
 * Anonymizes every not-yet-anonymized order tied to this email. Skips rows
 * that already have `anonymized_at` set, so calling this twice for the same
 * person is a safe no-op the second time rather than re-stamping
 * `anonymized_at` or re-generating a new erased-email suffix.
 */
export async function anonymizeOrdersByEmail(email: string): Promise<{ erasedCount: number }> {
  const db = supabaseAdmin();
  const summary = await findPersonalDataByEmail(email);
  const toErase = summary.orders.filter((order) => !order.anonymized_at);

  for (const order of toErase) {
    const patch = buildAnonymizedOrderPatch(order);
    const { error } = await db.from("orders").update(patch).eq("id", order.id);
    if (error) throw new Error(`anonymizeOrdersByEmail(${order.id}): ${error.message}`);
  }

  return { erasedCount: toErase.length };
}
