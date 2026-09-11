import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { timingSafeEqual } from "node:crypto";
import { ADMIN_COOKIE } from "./cookie";

/**
 * Admin gate for the AKH CMS. One owner, one shared token, no user table,
 * see CLAUDE.md's CMS section for why this pattern (borrowed from
 * studio-tooka, this user's Etsy shop app) instead of a full auth product.
 *
 * Enforced in two independent places, neither decorative:
 *   - `src/proxy.ts` compares the value at the edge, so a bad cookie never
 *     reaches a page that queries the database;
 *   - `requireAdminPage()` / `requireAdminAction()` below are the
 *     authoritative check: the one that still holds if the proxy matcher
 *     is ever edited.
 */

export { ADMIN_COOKIE };

export function tokenMatches(provided: string | undefined): boolean {
  const expected = process.env.ADMIN_TOKEN;
  // Fail closed when unset: a missing env var must never mean "no auth required."
  if (!expected || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return tokenMatches(store.get(ADMIN_COOKIE)?.value);
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
