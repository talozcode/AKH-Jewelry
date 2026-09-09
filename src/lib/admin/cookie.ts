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
 * Constant-time string compare, no `node:crypto`, so it works in both runtimes.
 *
 * Length is compared first and therefore leaks, which matches `tokenMatches` in `auth.ts`. The two
 * gates must not disagree about whether a value is valid.
 */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
