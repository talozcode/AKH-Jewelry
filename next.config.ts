import type { NextConfig } from "next";

/**
 * A QA security audit found NO response headers configured anywhere in
 * this app - no CSP, no X-Frame-Options, nothing but Vercel's own
 * platform-default Strict-Transport-Security. The concrete exposure:
 * /admin/login and every authenticated /admin/* page could be framed by
 * an external site with nothing blocking it - a clickjacking/UI-redress
 * attack against the single owner (an invisible iframe positioned over a
 * "Refund"/"Delete product" confirm button) had no defense at all.
 *
 * Deliberately NOT adding a full Content-Security-Policy here: this app
 * has no live browser access in this environment to verify one against
 * (a broken CSP silently breaking Stripe Checkout's redirect or an
 * inline script would be a far worse regression than the gap being
 * closed), and getting `script-src`/`style-src` exactly right needs a
 * real click-through test, not a guess. These are the headers that are
 * safe to add with zero risk of breaking anything - none of them affect
 * what the page is allowed to load, only how it can be embedded/read.
 * `frame-ancestors` and X-Frame-Options overlap deliberately (the
 * former is the modern replacement, but a handful of older browsers only
 * respect the latter).
 */
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
