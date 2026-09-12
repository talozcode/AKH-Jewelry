import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin/cookie";

/**
 * Next 16 renames the `middleware` convention to `proxy`. This file must
 * export `proxy()` and a `config.matcher`, not `middleware()` - confirmed
 * against this repo's own vendored docs at
 * node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md.
 *
 * This is the edge-level half of the admin gate; `requireAdminPage()` /
 * `requireAdminAction()` in `lib/admin/auth.ts` are the authoritative check
 * that still holds if this matcher is ever edited. See that file's comment
 * for the full two-layer design.
 *
 * Only checks that a cookie is present, not that it's the correct value.
 * It used to do the full exact-match check too, but once the owner can
 * rotate her own admin password (`src/lib/adminPassword.ts`, stored in the
 * database), the ONLY place that can verify a candidate value is correct
 * is somewhere that can query that database - and this file deliberately
 * never does that: it runs in the edge runtime specifically to stay fast
 * and dependency-free (no `node:crypto`, per `lib/admin/cookie.ts`'s own
 * comment, and no Supabase round-trip on every single admin request
 * either). A present-but-wrong cookie now reaches the page level instead
 * of being rejected here for free - `requireAdminPage()`/
 * `requireAdminAction()` are what actually enforce correctness, and were
 * already documented as the authoritative check before this change.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Exact match, not startsWith: only "/admin/login" itself is exempt from
  // the auth check. A prefix match would silently exempt any future route
  // that happens to start with the same string (e.g. "/admin/login-history").
  if (pathname === "/admin/login") return NextResponse.next();

  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!cookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
