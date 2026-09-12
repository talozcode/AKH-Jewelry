/**
 * The cookie name, alone in its own module with no imports.
 *
 * `proxy.ts` runs in the edge runtime and cannot load `node:crypto`, which `lib/admin/auth.ts`
 * needs for `timingSafeEqual`. Importing the name from there would drag that module into the edge
 * bundle. Duplicating the string instead would be worse: the gate and the login form must agree
 * about it, and a typo in one of two copies is a silent lockout.
 */
export const ADMIN_COOKIE = "akh_admin";

/**
 * Constant-time string compare, no `node:crypto`, so it's safe to call from
 * edge runtime code if a future check there ever needs one again -
 * `proxy.ts` used this for its exact-value check until the owner gained
 * the ability to rotate her own admin password (`../adminPassword.ts`),
 * which can only be verified against the database, something `proxy.ts`
 * deliberately never does (see that file's comment). `proxy.ts` now only
 * checks that a cookie is present, so nothing in `src/` currently calls
 * this - kept and still tested (cookie.test.ts) as the edge-safe primitive
 * for whenever an edge-runtime value comparison is needed again.
 */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
