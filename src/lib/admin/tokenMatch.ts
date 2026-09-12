import { timingSafeEqual } from "node:crypto";

/**
 * Pure, synchronous, env-var-only comparison against ADMIN_TOKEN - split
 * into its own leaf module (no imports of its own) so both `auth.ts` and
 * `../adminPassword.ts` can depend on it without creating a circular
 * import between those two (adminPassword.ts needs this as its fallback
 * when no rotated password is set; auth.ts needs adminPassword.ts's
 * DB-aware check for isAuthenticated()). Re-exported from `auth.ts` so the
 * existing `auth.test.ts` import path keeps working unchanged.
 */
export function tokenMatches(provided: string | undefined): boolean {
  const expected = process.env.ADMIN_TOKEN;
  // Fail closed when unset: a missing env var must never mean "no auth required."
  if (!expected || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
