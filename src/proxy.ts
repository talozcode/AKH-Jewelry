import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, safeEqual } from "@/lib/admin/cookie";

/**
 * Next 16 renames the `middleware` convention to `proxy`. This file must
 * export `proxy()` and a `config.matcher`, not `middleware()` — confirmed
 * against this repo's own vendored docs at
 * node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md.
 *
 * This is the edge-level half of the admin gate; `requireAdminPage()` /
 * `requireAdminAction()` in `lib/admin/auth.ts` are the authoritative check
 * that still holds if this matcher is ever edited to silently exclude a
 * route. See that file's comment for why both exist.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  const expected = process.env.ADMIN_TOKEN;

  // Fail closed when ADMIN_TOKEN is unset — a missing env var must never
  // read as "no auth required."
  if (!cookie || !expected || !safeEqual(cookie, expected)) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    const res = NextResponse.redirect(url);
    if (cookie) res.cookies.delete(ADMIN_COOKIE);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
