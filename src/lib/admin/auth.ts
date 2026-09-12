import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminCredential } from "../adminPassword";
import { ADMIN_COOKIE } from "./cookie";
import { tokenMatches } from "./tokenMatch";

/**
 * Admin gate for the AKH CMS. One owner, one credential, no user table,
 * see CLAUDE.md's CMS section for why this pattern (borrowed from
 * studio-tooka, this user's Etsy shop app) instead of a full auth product.
 *
 * Enforced in two independent places, neither decorative:
 *   - `src/proxy.ts` runs at the edge and rejects a request with no
 *     cookie at all, for free, before it reaches a page that queries the
 *     database - it deliberately does NOT do the full exact-value check
 *     (see that file's comment for why: no node:crypto in the edge
 *     runtime, and no database dependency wanted there either, especially
 *     once a rotated password - see ../adminPassword.ts - can only be
 *     verified against the database);
 *   - `requireAdminPage()` / `requireAdminAction()` below are the
 *     authoritative check: the one that still holds if the proxy matcher
 *     is ever edited, and the only one that knows about a rotated
 *     password at all.
 *
 * `tokenMatches()` (in ./tokenMatch.ts) stays a pure, synchronous,
 * env-var-only check with its own direct test (auth.test.ts) -
 * `../adminPassword.ts`'s `verifyAdminCredential()` wraps it as the
 * fallback for "no custom password set yet" rather than changing what
 * that function does. Split into its own leaf module specifically so
 * this file and adminPassword.ts can depend on each other's exports
 * without a circular import.
 */

export { ADMIN_COOKIE };
export { tokenMatches };

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifyAdminCredential(store.get(ADMIN_COOKIE)?.value);
}

/** Gate a page or layout. Redirects to the login form. */
export async function requireAdminPage(): Promise<void> {
  if (!(await isAuthenticated())) redirect("/admin/login");
}

/**
 * Gate a Server Action. Call this as the first line of every admin mutation
 * (create/update/delete product, update order status, upload image),
 * the proxy matcher doesn't cover Server Actions, so this is the real check
 * for those.
 */
export async function requireAdminAction(): Promise<void> {
  if (!(await isAuthenticated())) {
    throw new Error("Not authenticated");
  }
}
