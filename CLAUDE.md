@AGENTS.md

# AKH Jewelry — Redesign

Complete redesign of a friend's jewelry e-commerce site (akhjewelry.com, currently on
Wix). Part of the "talozcode" family of side projects. See the original brief for the
full requirements — this file tracks what's actually built.

## LOCKED: final design direction (2026-09-09)

The client provided a detailed, prescriptive design brief ("quiet objects
of light" — quiet, tactile, earthy, contemporary studio; Ancient Egyptian
akh meaning kept conceptual/in-prose only, never a literal visual motif)
and approved it after reviewing it live on a branch. **This is now the
canonical direction on `main` — do not revert to an earlier palette/font
without the user explicitly asking.** It was built on `design/quiet-objects-of-light`
and merged 2026-09-09.

- **Exact tokens** (`src/app/globals.css`, values only — token *names*
  unchanged from before so every component inherits automatically): Warm
  Bone `#F3EFE7` (`--color-ivory`, main bg), Stone `#D8D0C3`
  (`--color-ivory-deep` / `--color-stone`, alt bg), Deep Olive `#34392C`
  (`--color-charcoal`, primary dark + primary button fill), Sage Olive
  `#747861` (`--color-copper`, brand accent), Khaki `#999174`
  (`--color-copper-soft`, secondary accent), Soft Black `#20211D`
  (`--color-ink`, text), plus a new **Aged Brass** `#A68C59`
  (`--color-brass`) for the one small metallic accent — use it sparingly
  (~5–10% of the visual system per the brief; the jewelry provides the gold).
- **Typography**: **Cormorant Garamond** is the editorial headline serif
  (`font-display`, replaces Fraunces). Inter stays for body/nav/prices/UI.
  The handwritten Caveat wordmark stays logo-only, never a general display
  font — this was already true and the brief reconfirms it.
- **Primary button system — this DELIBERATELY supersedes the "no filled
  brand-color buttons" research rule below.** Primary CTAs are filled Deep
  Olive bg / Warm Bone text (`bg-charcoal text-ivory`); secondary CTAs stay
  transparent with a thin olive-or-soft-black border. Applied to the real
  commerce action (`PurchaseArea.tsx` Add to Cart + sticky bar) and the
  homepage CTAs. Other pages' secondary buttons (story/bespoke/cart) were
  already outline-with-black-border, which already matches the brief's
  secondary spec, so they're untouched.
- **Homepage** (`src/app/(site)/page.tsx`) was rebuilt to the brief's exact
  structure and copy: photographic hero ("objects of light." / "Jewelry
  shaped by transformation, time and the beauty of imperfection." / "Shop
  collection →"), selected pieces, one full-bleed editorial photography
  moment, a short concrete studio story, a small *quiet* "meaning behind
  the name" section (the only place Egyptian symbolism appears, and only
  in prose — the brief is explicit that a visitor should think "beautiful
  contemporary jewelry brand" first and discover the deeper meaning
  second), and a closing CTA. The old ticker/testimonials/multi-step
  craftsmanship+bespoke sections were trimmed — the brief says not to
  overwhelm the homepage with philosophy and to let the jewelry and
  photography lead.
- **Corners stay square/near-square, icons stay thin/minimal, animation
  stays slow and sparse** (image reveals, gentle fades, hover transitions)
  — this was already the case and the brief reconfirms it as a hard rule,
  not a default to second-guess.
- Scope note: token/font/button changes apply site-wide (shared theme +
  shared components), but shop/product/policy page *layout* wasn't
  restructured — only the homepage content was rebuilt to the brief.

## Route structure: `(site)` group + `/design-concepts`

All live-site routes moved under `src/app/(site)/` (a route group — doesn't
affect URLs) with their own `(site)/layout.tsx` owning `<Header/>`/`<Footer/>`.
Root `src/app/layout.tsx` now only sets up `<html>/<body>` and fonts. This
exists so `src/app/design-concepts/page.tsx` — an internal, noindexed page
comparing 5 alternative visual directions for the whole brand, built when the
user said "I am not sure about the design" — can render with NO site chrome
at all. **One of those 5 concepts (well, a separate, more detailed brief
built afterward) is what's now live on `main` — see "LOCKED" above.**
`/design-concepts` itself is left in place as a historical record; it's not
linked from the live site. If you add a new top-level route that should show
Header/Footer, put it under `(site)/`, matching every existing route.
`design-concepts/` is deliberately outside `globals.css`'s influence — see
its own `_lib/shared-content.ts` and `_components/Concept{A,B,C,D,E}.tsx`
(each fully self-scoped, own hex consts and font loads, never touching the
global tokens).

## Why the design looks the way it does (design-system research history)

Two research agents studied the actual shipped CSS/HTML of real indie-artisan
jewelry sites (Catbird NYC, Wwake, Grainne Morton, Alighieri) to fix an
earlier "cheap template" pass. Findings, and their status now that the
LOCKED brief above is live:

- ~~Filled brand-color CTA buttons are a tell~~ — **superseded.** The
  locked brief explicitly specifies a filled Deep-Olive primary button.
  This is now the deliberate system, not a lapse.
- **A tracked-out uppercase eyebrow label above every section heading is
  still a tell** — the locked brief doesn't ask for one either. Don't add
  one back.
- **Middle-dot-joined metadata ("Name · Detail") still reads as templated
  attribution chrome** — stays removed from `ProductCard.tsx` and the
  homepage testimonials.
- **The real differentiator comes from actual subject matter, not a
  swapped color/font** — AKH's real Hebrew names/meanings in `product.story`
  (e.g. Kohl Davar Bezmano, Levone/kunzite) are still the thing to lean on;
  the locked brief's own "meaning behind the name" section is the same
  instinct applied to the brand name itself.
- One deliberate moving element (the marquee ticker) was trimmed from the
  homepage in the locked rebuild in favor of an even quieter page — the
  brief's "don't overwhelm, let photography lead" instruction. If you add
  motion back anywhere, keep it slow/sparse per the brief, not scattered.

## Stack

- Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS v4
- Fonts: Cormorant Garamond (display serif) + Inter (sans) + Caveat (logo
  script), via `next/font/google`
- Supabase (Postgres + Storage) backs the CMS — see "CMS" below. Marked
  **temporary** by the user ("temporary until I give you a new account");
  the schema/migration story is designed so moving projects later is a
  re-provision + data/asset copy, not a code rewrite.
- No cart/checkout backend yet — see "What's stubbed" below

## CMS (built 2026-09-09)

Full admin backend at `/admin` — the site owner can edit products (with
photo upload), see reservation requests, and view basic stats, without
touching code. See the approved plan at
`.claude/plans/i-am-not-sure-steady-clover.md` (or the session that built
this) for the original design rationale; this section is the living
reference.

- **Database**: Supabase project `jsqcgpvwrhtghijsdpei` (region
  `ap-southeast-2`/Sydney). Two tables: `products` (mirrors `Product` in
  `src/lib/types.ts`, plus `is_featured`/`is_hero`/`is_published` for
  owner-controlled homepage picks and draft staging) and `reservations`
  (snapshots product name/slug/price/currency at submission time, plus a
  nullable FK, so a reservation stays meaningful even after the product is
  later edited or deleted). Schema lives in
  `supabase/migrations/0001_init.sql`. Access is `@supabase/supabase-js`
  directly (no ORM — 2 tables doesn't earn one) via
  `src/lib/supabase/server.ts`'s `supabaseAdmin()`, which uses the
  **secret key** (bypasses RLS) and is **server-only** — there is
  deliberately no browser-side Supabase client or publishable-key usage
  anywhere in this app.
- **Env vars** (`.env.local`, gitignored — not committed):
  `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_PUBLISHABLE_KEY` (unused
  today, kept for completeness), `ADMIN_TOKEN` (the owner's login
  password). All four must also be set on Vercel for prod/preview
  deployments — they are NOT set there yet as of this build.
- **Auth**: a single shared-token cookie (`akh_admin`), matching the
  pattern already proven in `studio-tooka` (this user's Etsy shop app) —
  not Supabase Auth, deliberately, to avoid standing up a full auth
  product for one owner and to keep login decoupled from the "temporary"
  Supabase project. Enforced twice: `src/proxy.ts` (edge, Next 16's
  renamed `middleware.ts`) and `requireAdminPage()`/`requireAdminAction()`
  in `src/lib/admin/auth.ts` (the authoritative check — Server Actions
  aren't covered by the proxy matcher, so every admin mutation calls
  `requireAdminAction()` itself). Fails closed if `ADMIN_TOKEN` is unset.
  Login at `/admin/login`; the `(console)` route group keeps that page
  chrome-free the same way `(site)` does for the storefront.
- **Images**: Supabase Storage public bucket `product-images`. Uploads go
  through a Server Action (`products/actions.ts`'s
  `uploadProductImageAction`), resized to 1800px longest edge via `sharp`
  before storing (Wix's CDN used to do this resize for free; Storage
  doesn't). `wixImg()` (`src/lib/wixImage.ts`) now passes through any
  string starting with `http` unchanged, so a product's `images[]` can mix
  legacy Wix ids (the original 15 products) and new Supabase Storage URLs
  on the same product with no other code changes.
- **Reservations, not orders**: no payment collection (Stripe stays
  deferred, per the user's standing decision). "Add to Cart" on a product
  page (`src/components/PurchaseArea.tsx`) reveals an inline form (name,
  email, phone — all required; message optional) and submits via
  `src/lib/actions/reservations.ts`'s public `createReservation()`. The
  owner sees these at `/admin/reservations`, filterable by status
  (`new → contacted → fulfilled`, plus `cancelled`), and moves them
  through statuses inline. Confirming and taking payment still happens
  manually, outside the site.
- **Product data is now Supabase-backed**: `src/lib/products.ts` was
  rewritten from a static array to async functions
  (`getProducts()`/`getProductBySlug()`/`getRelated()`/etc.) — same import
  path, so every caller only needed `await` added. The original 15-product
  static array moved verbatim to `src/lib/legacy-products-seed.ts`, used
  only by (a) `scripts/seed-products.ts` (the one-time seed, already run)
  and (b) `design-concepts/_lib/shared-content.ts`, which deliberately
  stays on the frozen legacy data rather than becoming async, since that
  page is a historical record, not live.
- **Homepage picks are now owner-controlled**: the old hardcoded
  `SELECTED`/`HERO_PRODUCT` arrays in `page.tsx` are gone — the homepage
  reads `is_featured`/`is_hero` from the database instead, editable per
  product in `/admin/products`.
- `/`, `/shop`, and `/product/[slug]` are `force-dynamic` (no static
  generation/ISR) so a `/admin` edit shows up immediately without a
  redeploy — acceptable at this catalog size and traffic level; revisit if
  either grows enough that dynamic rendering becomes a real cost.
- **Dashboard** (`/admin`, `src/lib/admin/metrics.ts`): product counts by
  category/availability, reservation counts by status, most-reserved
  products (grouped on the reservation snapshot, so it stays correct after
  a product is edited/deleted), recent activity. No revenue/analytics
  numbers are shown — there's no real payment data yet, and inventing one
  would be a lie.
- **Not built**: draft-product review workflow beyond the plain
  publish/unpublish checkbox, bulk product actions, a reservations detail
  page (inline status change on the list row covers the stated need),
  audit log of admin edits.

## Images (important — read before touching image code)

- **Product photos are real**, scraped from the live akhjewelry.com product pages
  (2026-09-07). `src/lib/products.ts` stores each image as a bare Wix media id
  (`"<32-hex-id>.<ext>"`, e.g. `"682d76e02811499b9d6b09bab93722ba.jpg"`).
  `src/lib/wixImage.ts`'s `wixImg()` turns that into a resized
  `static.wixstatic.com` URL. **All of akhjewelry.com's media lives under the
  site prefix `4bc845_`** — `wixImg()` prepends it automatically. If you add a
  new image id, store it WITHOUT the prefix (the helper adds it), and verify
  the id resolves (`curl -o /dev/null -w '%{http_code}' <url>`) before trusting
  it — a wrong/missing prefix silently 403s instead of 404ing.
- Product images render via plain `<img>` (see `ProductImage.tsx`), not
  `next/image` — deliberate, so the browser (not the Vercel server) makes the
  request. Wix's CDN 403s requests from some datacenter/cloud IPs; end users'
  browsers are unaffected. Some real product photos are candid lifestyle
  shots with warm cream/tan/blush backdrops (a ring on a flower, a pendant on
  skin), not white studio shots — account for that when reusing the same
  photo across differently-colored sections (color-grade with a CSS filter
  if needed, as `design-concepts`'s Concepts B/C/D do).
- **Editorial/mood photography where no real AKH photo exists** uses curated
  stock from Pexels — see `src/lib/stockImages.ts`. Free commercial license,
  no attribution required. Never presented as a specific real person.
- The user has real photos of AKH's actual packaging (olive satin pouch,
  taupe box, blush/kraft bag, brass ribbon, handwritten wordmark) and the
  real Instagram bio/style (soft, minimalist, lifestyle — see prior git
  history for the full research note) — both already reflected in the
  locked design above. If real studio photography turns up later, prefer
  it over Pexels immediately.
- The old `PlaceholderArt` SVG-placeholder system from the first pass is gone.

## What's built (Phase 1 — Conversion Essentials)

- Homepage (`src/app/(site)/page.tsx`): rebuilt per the locked brief — see
  "LOCKED" section above for the exact structure.
- Shop (`src/app/(site)/shop/`): category tabs (Rings/Necklaces/Bracelets —
  matches the real site's actual categories) + filter set (category,
  material, stone, price, availability, collection), mobile filter drawer,
  responsive grid
- Product page (`src/app/(site)/product/[slug]/page.tsx`): gallery using
  however many real photos exist for that piece (1–4), click-to-zoom, full
  spec block, expandable info accordion, sticky mobile Add to Cart bar,
  curated "you may also like" (max 4), Product + BreadcrumbList JSON-LD
- Supporting pages: `/story`, `/bespoke`, `/faq`, `/contact`,
  `/shipping-returns`, `/care`, `/size-guide` (EU ring sizing, matching the
  real site), `/terms`, `/cart` (functional stubs, most need real Phase 2
  content and the new button/type system hasn't been extended to them yet)

## What's stubbed / explicitly NOT built yet

- **Checkout/payments**: decided with the user (2026-09-07) to use custom
  Stripe Checkout eventually, but NOT built yet. "Add to Cart" shows a
  request-sent state and points to `hello@akhjewelry.com`; there is no cart
  state, no payment processing, no order backend.
- Analytics/conversion tracking, abandoned-cart email, wishlist persistence
  (the heart icon toggles local state only, nothing is saved), search
  (icon is present, not wired), account pages, real newsletter signup (form
  is a no-op stub in `NewsletterForm.tsx`).

## Product data grounding

The 15 real products pulled from akhjewelry.com (2026-09-07) — real name,
price (₪), material, stone, and story copy from each product's actual
page — are now seeded into Supabase (see "CMS" above) rather than living in
a static array. Names are standardized to one system (Title Case) in place
of the live site's mix of ALL CAPS ("SHMIRAH VOL 1") and Title Case, per the
brief's naming-consistency requirement — this is the one deliberate change
from the source data. Categories match the real site exactly: Rings,
Necklaces, Bracelets (no invented "Ready to Wear" category — the live
site's version of that category wasn't sampled). Only 15 of ~45 real
products are in the catalog so far — add the rest through `/admin` rather
than editing code now that the CMS exists.

## Next steps (not started)

- Set the four CMS env vars (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`,
  `SUPABASE_PUBLISHABLE_KEY`, `ADMIN_TOKEN`) on Vercel for prod/preview —
  the CMS works locally but hasn't been deployed with real env vars yet.
- Wire Stripe Checkout once the user confirms it's time (reservations now
  give real orders somewhere to live; payment collection is still manual).
- Phase 2: stronger brand story content, real testimonials/press (current
  testimonials are illustrative placeholder quotes, clearly not tied to real
  named customers or photos), full bespoke request form
- Phase 3: SEO pass, analytics, wishlist/abandoned-cart wiring, editorial
  collection pages, and pulling in the rest of the live catalog (only 15 of
  ~45 real products are in `products.ts` so far)
- Replace Pexels mood photography with real AKH studio photography once shot
- Extend the locked button/type system from the homepage to shop/product/
  policy pages (currently only the homepage and the shared `PurchaseArea`
  component were updated to the new primary/secondary button system)
