@AGENTS.md

# AKH Jewelry: Redesign

Complete redesign of a friend's jewelry e-commerce site (akhjewelry.com, currently on
Wix). Part of the "talozcode" family of side projects. See the original brief for the
full requirements; this file tracks what's actually built.

## LOCKED: final design direction (2026-09-09)

The client provided a detailed, prescriptive design brief ("quiet objects
of light": quiet, tactile, earthy, contemporary studio; Ancient Egyptian
akh meaning kept conceptual/in-prose only, never a literal visual motif)
and approved it after reviewing it live on a branch. **This is now the
canonical direction on `main`; do not revert to an earlier palette/font
without the user explicitly asking.** It was built on `design/quiet-objects-of-light`
and merged 2026-09-09.

- **Exact tokens** (`src/app/globals.css`, values only; token *names*
  unchanged from before so every component inherits automatically): Warm
  Bone `#F3EFE7` (`--color-ivory`, main bg), Stone `#D8D0C3`
  (`--color-ivory-deep` / `--color-stone`, alt bg), Deep Olive `#34392C`
  (`--color-charcoal`, primary dark + primary button fill), Sage Olive
  `#747861` (`--color-copper`, brand accent), Khaki `#999174`
  (`--color-copper-soft`, secondary accent), Soft Black `#20211D`
  (`--color-ink`, text), plus a new **Aged Brass** `#A68C59`
  (`--color-brass`) for the one small metallic accent; use it sparingly
  (~5-10% of the visual system per the brief; the jewelry provides the gold).
- **Typography**: **Cormorant Garamond** is the editorial headline serif
  (`font-display`, replaces Fraunces). Inter stays for body/nav/prices/UI.
  The handwritten Caveat wordmark stays logo-only, never a general display
  font; this was already true and the brief reconfirms it.
- **Primary button system: this DELIBERATELY supersedes the "no filled
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
  collection &rarr;"), selected pieces, one full-bleed editorial photography
  moment, a short concrete studio story, a small *quiet* "meaning behind
  the name" section (the only place Egyptian symbolism appears, and only
  in prose; the brief is explicit that a visitor should think "beautiful
  contemporary jewelry brand" first and discover the deeper meaning
  second), and a closing CTA. The old ticker/testimonials/multi-step
  craftsmanship+bespoke sections were trimmed; the brief says not to
  overwhelm the homepage with philosophy and to let the jewelry and
  photography lead.
- **Corners stay square/near-square, icons stay thin/minimal, animation
  stays slow and sparse** (image reveals, gentle fades, hover transitions).
  This was already the case and the brief reconfirms it as a hard rule,
  not a default to second-guess.
- Scope note: token/font/button changes apply site-wide (shared theme +
  shared components), but shop/product/policy page *layout* wasn't
  restructured; only the homepage content was rebuilt to the brief.

## Route structure: `(site)` group + `/design-concepts`

All live-site routes moved under `src/app/(site)/` (a route group; doesn't
affect URLs) with their own `(site)/layout.tsx` owning `<Header/>`/`<Footer/>`.
Root `src/app/layout.tsx` now only sets up `<html>/<body>` and fonts. This
exists so `src/app/design-concepts/page.tsx`, an internal, noindexed page
comparing 5 alternative visual directions for the whole brand, built when the
user said "I am not sure about the design", can render with NO site chrome
at all. **One of those 5 concepts (well, a separate, more detailed brief
built afterward) is what's now live on `main`; see "LOCKED" above.**
`/design-concepts` itself is left in place as a historical record; it's not
linked from the live site. If you add a new top-level route that should show
Header/Footer, put it under `(site)/`, matching every existing route.
`design-concepts/` is deliberately outside `globals.css`'s influence; see
its own `_lib/shared-content.ts` and `_components/Concept{A,B,C,D,E}.tsx`
(each fully self-scoped, own hex consts and font loads, never touching the
global tokens).

## Why the design looks the way it does (design-system research history)

Two research agents studied the actual shipped CSS/HTML of real indie-artisan
jewelry sites (Catbird NYC, Wwake, Grainne Morton, Alighieri) to fix an
earlier "cheap template" pass. Findings, and their status now that the
LOCKED brief above is live:

- ~~Filled brand-color CTA buttons are a tell~~: **superseded.** The
  locked brief explicitly specifies a filled Deep-Olive primary button.
  This is now the deliberate system, not a lapse.
- **A tracked-out uppercase eyebrow label above every section heading is
  still a tell**: the locked brief doesn't ask for one either. Don't add
  one back.
- **Middle-dot-joined metadata ("Name . Detail") still reads as templated
  attribution chrome**: stays removed from `ProductCard.tsx` and the
  homepage testimonials.
- **The real differentiator comes from actual subject matter, not a
  swapped color/font**: AKH's real Hebrew names/meanings in `product.story`
  (e.g. Kohl Davar Bezmano, Levone/kunzite) are still the thing to lean on;
  the locked brief's own "meaning behind the name" section is the same
  instinct applied to the brand name itself.
- One deliberate moving element (the marquee ticker) was trimmed from the
  homepage in the locked rebuild in favor of an even quieter page: the
  brief's "don't overwhelm, let photography lead" instruction. If you add
  motion back anywhere, keep it slow/sparse per the brief, not scattered.

## Stack

- Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS v4
- Fonts: Cormorant Garamond (display serif) + Inter (sans) + Caveat (logo
  script), via `next/font/google`
- Supabase (Postgres + Storage) backs the CMS; see "CMS" below. Marked
  **temporary** by the user ("temporary until I give you a new account");
  the schema/migration story is designed so moving projects later is a
  re-provision + data/asset copy, not a code rewrite.
- No cart/checkout backend yet; see "What's stubbed" below

## CMS (built 2026-09-09)

Full admin backend at `/admin`: the site owner can edit products (with
photo upload) and view basic stats, without touching code. See the
approved plan at `.claude/plans/i-am-not-sure-steady-clover.md` (or the
session that built this) for the original design rationale; this section
is the living reference.

- **Database**: Supabase project `jsqcgpvwrhtghijsdpei` (region
  `ap-southeast-2`/Sydney). `products` (mirrors `Product` in
  `src/lib/types.ts`, plus `is_featured`/`is_hero`/`is_published` for
  owner-controlled homepage picks and draft staging). Schema lives in
  `supabase/migrations/0001_init.sql`. Access is `@supabase/supabase-js`
  directly (no ORM; the table count doesn't earn one) via
  `src/lib/supabase/server.ts`'s `supabaseAdmin()`, which uses the
  **secret key** (bypasses RLS) and is **server-only**: there is
  deliberately no browser-side Supabase client or publishable-key usage
  anywhere in this app. **The original `reservations` table (a
  no-payment enquiry feature, superseded once real Stripe checkout
  shipped) was dropped 2026-09-11**: it held 0 rows, its Server Action
  was an unauthenticated public write endpoint with zero callers, and
  `orders` (below) is the real purchase record now. See
  `supabase/migrations/0004_drop_reservations.sql`.
- **Env vars** (`.env.local`, gitignored, not committed):
  `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_PUBLISHABLE_KEY` (unused
  today, kept for completeness), `ADMIN_TOKEN` (the owner's login
  password, rotated off its original placeholder 2026-09-11). All four
  are also set on the Vercel project (production/preview/development)
  via the team-scoped token in this user's `reference_vercel_token`
  memory. The content-CMS expansion below reuses these same four; no new
  env vars were added.
- **Auth**: a single shared-token cookie (`akh_admin`, 7-day expiry),
  matching the pattern already proven in `studio-tooka` (this user's Etsy
  shop app), not Supabase Auth, deliberately, to avoid standing up a full
  auth product for one owner and to keep login decoupled from the
  "temporary" Supabase project. Enforced twice: `src/proxy.ts` (edge,
  Next 16's renamed `middleware.ts`) and
  `requireAdminPage()`/`requireAdminAction()` in `src/lib/admin/auth.ts`
  (the authoritative check; Server Actions aren't covered by the proxy
  matcher, so every admin mutation calls `requireAdminAction()` itself).
  Fails closed if `ADMIN_TOKEN` is unset. Login at `/admin/login`; the
  `(console)` route group keeps that page chrome-free the same way
  `(site)` does for the storefront.
- **Images**: Supabase Storage public bucket `product-images`. Uploads go
  through a Server Action (`products/actions.ts`'s
  `uploadProductImageAction`), resized to 1800px longest edge via `sharp`
  before storing (Wix's CDN used to do this resize for free; Storage
  doesn't). `wixImg()` (`src/lib/wixImage.ts`) now passes through any
  string starting with `http` unchanged, so a product's `images[]` can mix
  legacy Wix ids (the original 15 products) and new Supabase Storage URLs
  on the same product with no other code changes.
- **Product data is now Supabase-backed**: `src/lib/products.ts` was
  rewritten from a static array to async functions
  (`getProducts()`/`getProductBySlug()`/`getRelated()`/etc.), same import
  path, so every caller only needed `await` added. The original 15-product
  static array moved verbatim to `src/lib/legacy-products-seed.ts`, used
  only by (a) `scripts/seed-products.ts` (the one-time seed, already run)
  and (b) `design-concepts/_lib/shared-content.ts`, which deliberately
  stays on the frozen legacy data rather than becoming async, since that
  page is a historical record, not live.
- **Homepage picks are now owner-controlled**: the old hardcoded
  `SELECTED`/`HERO_PRODUCT` arrays in `page.tsx` are gone; the homepage
  reads `is_featured`/`is_hero` from the database instead, editable per
  product in `/admin/products`.
- `/`, `/shop`, and `/product/[slug]` are `force-dynamic` (no static
  generation/ISR) so a `/admin` edit shows up immediately without a
  redeploy; acceptable at this catalog size and traffic level, revisit if
  either grows enough that dynamic rendering becomes a real cost.
- **Dashboard** (`/admin`, `src/lib/admin/metrics.ts`): product counts by
  category/availability, order counts by fulfillment status, revenue by
  currency, recent orders. See "Checkout / payments" below for what
  backs this.
- **Not built**: draft-product review workflow beyond the plain
  publish/unpublish checkbox, bulk product actions, audit log of admin
  edits.

### Content CMS expansion (built 2026-09-09): pages, settings, media, collections

A second phase, scoped to the "P0 Foundation" tier of a client-supplied
CMS blueprint PDF (structured content, global settings, media, collection
schemas; explicitly NOT the PDF's P1/P2: no journal/blog, campaigns, nav
menu editor, real contact/bespoke form backends, roles, localization,
search, analytics, or a draft/preview/publish workflow). See
`.claude/plans/i-am-not-sure-steady-clover.md` for the full rationale;
this section is the living reference. Schema in
`supabase/migrations/0002_cms_expansion.sql`.

- **`pages`**: one row per page (`home`, `story`, `bespoke`, `faq`,
  `shipping-returns`, `care`, `size-guide`, `contact`, `terms`), a
  `content jsonb` column typed by a hand-written discriminated union
  (`PageContent` in `src/lib/pages.ts`; no Zod/validation library exists
  in this codebase, same trust level as every other admin mutation).
  `getPage(key)` shallow-merges the DB row over `DEFAULTS[key]`, so a
  missing/partial field never crashes rendering. `DEFAULTS` is the exact
  current hardcoded copy transcribed byte-for-byte: it's both the
  fallback and the seed source (`scripts/seed-pages.ts`, run once via
  `npm run seed:pages`; a targeted `on conflict` SQL update, not this
  script, is how a single key's copy gets corrected after launch, so an
  admin's edits to unrelated pages are never clobbered). Edited at
  `/admin/pages/[key]`, one small purpose-built form component per page
  shape (`HomeForm`, `StoryForm`, `BespokeForm`, `FaqForm`,
  `SectionsForm`, `SimpleListForm`, `SizeGuideForm`, `SimpleProseForm` in
  `pages/_forms/`), deliberately NOT a generic block/JSON editor, per the
  "structured fields, not blocks" scope decision. Long-form prose fields
  (home's story/name sections, story's body, terms) are one textarea
  rendered as paragraphs split on blank lines.
- **`site_settings`**: a singleton row (contact email/phone/WhatsApp,
  Instagram/TikTok URLs, footer blurb), edited at `/admin/site-settings`.
  Read by `(site)/layout.tsx` and passed to `Footer`, and by
  `product/[slug]/page.tsx` for `PurchaseArea`'s enquiry mailto; this
  replaced `hello@akhjewelry.com` being hardcoded independently in 7+
  files. **Nav menu structure stays hardcoded** (`Header.tsx`'s `NAV`,
  `Footer.tsx`'s `COLUMNS`); a full nav editor is out of scope this
  phase.
- **Media library**: new Storage bucket `site-media` (separate from
  `product-images`; different ownership model, see the plan for why),
  tracked in a minimal `media_assets` table (no alt/caption/tag/focal
  point, deliberately out of scope). `/admin/media` for upload/browse/
  delete; a shared `<MediaPicker>` (`admin/(console)/_components/`) is
  used inside the page/collection forms wherever an image field exists:
  a flat thumbnail grid plus a raw-URL input as an escape hatch.
- **`collections`**: a genuinely new concept (curated named groupings
  like "Akhet"/"Scarab", hero + intro + story + an ordered
  `product_slugs text[]`, mirroring the `products.images[]` array
  convention rather than a join table). **Not the same thing as** the
  pre-existing `ShopClient.tsx` "Core Collection / One of One" filter
  facet (derived from `product.limitedEdition`); that stays untouched.
  Admin CRUD at `/admin/collections` (mirrors `/admin/products`
  exactly); public at `/collections` and `/collections/[slug]`.
- **Still immediate-save, no draft/publish workflow**: `pages` and
  `site_settings` go live the instant they're saved, same as products
  always have. Only `collections` gets `is_published` (the one new
  entity with a real not-ready-yet use case).
- Verified zero visual regression: every migrated page's rendered HTML
  was diffed against its original hardcoded copy before this shipped.

## Images (important: read before touching image code)

- **Product photos are real**, originally scraped from the live
  akhjewelry.com product pages (2026-09-07). Live `products.images[]`
  entries are now Supabase Storage URLs, re-hosted 2026-09-11 by
  `scripts/migrate-legacy-images.ts` (see the backlog's "Not standalone"
  section); `wixImg()`/`ProductImage.tsx` still pass any `http`-prefixed
  string through unchanged, so this needed no component changes.
  `src/lib/legacy-products-seed.ts` (frozen, no longer the live data
  source) still stores each image as a bare Wix media id
  (`"<32-hex-id>.<ext>"`, e.g. `"682d76e02811499b9d6b09bab93722ba.jpg"`)
  for `design-concepts`'s sake; `src/lib/wixImage.ts`'s `wixImg()` turns
  that into a resized `static.wixstatic.com` URL. **All of
  akhjewelry.com's media lives under the site prefix `4bc845_`**;
  `wixImg()` prepends it automatically. If you add a new image id, store
  it WITHOUT the prefix (the helper adds it), and verify the id resolves
  (`curl -o /dev/null -w '%{http_code}' <url>`) before trusting it: a
  wrong/missing prefix silently 403s instead of 404ing.
- Product images render via plain `<img>` (see `ProductImage.tsx`), not
  `next/image`; deliberate, so the browser (not the Vercel server) makes the
  request. Some real product photos are candid lifestyle
  shots with warm cream/tan/blush backdrops (a ring on a flower, a pendant on
  skin), not white studio shots; account for that when reusing the same
  photo across differently-colored sections (color-grade with a CSS filter
  if needed, as `design-concepts`'s Concepts B/C/D do).
- **Editorial/mood photography where no real AKH photo exists** uses curated
  stock originally sourced from Pexels (free commercial license, no
  attribution required, never presented as a specific real person); see
  `src/lib/stockImages.ts`. The two photos actually used live
  (`home`/`story`'s shared hero shot, `bespoke`'s) are now re-hosted in
  Supabase Storage too, registered in `media_assets` so they show up in
  `/admin/media`; `STOCK` in `stockImages.ts` still points at the
  original Pexels URLs and is only the migration script's source, not
  something pages read from directly (pages read their own `pages` row).
- The user has real photos of AKH's actual packaging (olive satin pouch,
  taupe box, blush/kraft bag, brass ribbon, handwritten wordmark) and the
  real Instagram bio/style (soft, minimalist, lifestyle; see prior git
  history for the full research note), both already reflected in the
  locked design above. If real studio photography turns up later, prefer
  it over Pexels immediately.
- The old `PlaceholderArt` SVG-placeholder system from the first pass is gone.

## What's built (Phase 1: Conversion Essentials)

- Homepage (`src/app/(site)/page.tsx`): rebuilt per the locked brief; see
  "LOCKED" section above for the exact structure.
- Shop (`src/app/(site)/shop/`): category tabs (Rings/Necklaces/Bracelets;
  matches the real site's actual categories) + filter set (category,
  material, stone, price, availability, collection), mobile filter drawer,
  responsive grid
- Product page (`src/app/(site)/product/[slug]/page.tsx`): gallery using
  however many real photos exist for that piece (1-4), click-to-zoom, full
  spec block, expandable info accordion, sticky mobile Add to Cart bar,
  curated "you may also like" (max 4), Product + BreadcrumbList JSON-LD
- Supporting pages: `/story`, `/bespoke`, `/faq`, `/contact`,
  `/shipping-returns`, `/care`, `/size-guide` (EU ring sizing, matching the
  real site), `/terms`, `/cart` (functional stubs, most need real Phase 2
  content and the new button/type system hasn't been extended to them yet,
  but all their copy is now CMS-editable at `/admin/pages`, see the
  "Content CMS expansion" section above)
- `/collections` and `/collections/[slug]`: new curated-collection pages,
  owner-managed at `/admin/collections`, empty until the owner creates
  the first one

## Checkout / payments (built 2026-09-09)

Real Stripe Checkout: the site is a working e-commerce store, not a
reservation-only enquiry funnel (the old reservations feature was
deleted 2026-09-11 once this shipped; see "CMS" above). "Buy Now" on a
product page (`PurchaseArea.tsx`) redirects to a **hosted** Stripe
Checkout Session (`src/lib/actions/checkout.ts`'s
`createCheckoutSession()`), no `@stripe/stripe-js`/Elements anywhere, the
browser never loads Stripe.js, it's a pure redirect to `session.url` and
back. One product (+ selected size) per checkout: **no multi-item cart**
(`/cart` stays the same placeholder it's always been, deliberately).

- **`orders` table** (`supabase/migrations/0003_orders.sql`, now the
  only table holding customer personal data). Snapshot fields
  (product name/slug/price/currency), flat shipping-address columns, a
  `stripe_checkout_session_id` unique constraint as the idempotency guard
  against webhook retries, and a `status` (`unfulfilled`/`shipped`;
  fulfillment state, not payment state; a row only ever exists for a
  session that already paid).
- **Webhook**: `src/app/api/webhooks/stripe/route.ts` (this repo's first
  API Route Handler). Verifies `stripe-signature` against
  `STRIPE_WEBHOOK_SECRET` using the **raw** request body (`req.text()`,
  never `req.json()` first). On `checkout.session.completed`, inserts one
  `orders` row and, the important business rule, **auto-flips an "In
  Stock" product to "Out of Stock" the instant payment confirms**, so a
  physical one-of-one piece can't be sold twice. "Made to Order" pieces
  are never flipped (no fixed inventory; they go through the exact same
  instant checkout, lead time is just dispatch-copy messaging).
- **No shipping fee** (free worldwide shipping, per the user's decision)
  and **no automatic tax** (Stripe Tax off): prices charge exactly as
  shown on the site. A shipping address IS still collected (physical
  goods), across Stripe's full supported country list.
- **Env vars**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`. The
  webhook secret can only be obtained AFTER this route is deployed and
  registered against a real HTTPS URL in the Stripe Dashboard (hard
  sequencing constraint, not a style choice). Build/test against a
  Stripe **test-mode** key first.
- `src/app/(site)/order/success/page.tsx` reads the Checkout Session
  directly from Stripe's API (not the `orders` table; the webhook may
  not have run yet by the time the browser redirects back).
- `/admin/orders` lists paid orders with shipping address, lets the
  owner mark shipped. The dashboard shows real revenue (grouped by
  currency, never summed across ILS/USD) and unfulfilled-order counts.

## What's stubbed / explicitly NOT built yet

- Analytics/conversion tracking, abandoned-cart email, wishlist persistence
  (the heart icon toggles local state only, nothing is saved), search
  (icon is present, not wired), account pages, newsletter signup (the
  no-op `NewsletterForm.tsx` stub was deleted 2026-09-11 since it
  actively misled visitors; the footer now just points at the studio
  email until a real signup exists).

## Product data grounding

The 15 real products pulled from akhjewelry.com (2026-09-07), real name,
price (₪), material, stone, and story copy from each product's actual
page, are now seeded into Supabase (see "CMS" above) rather than living in
a static array. Names are standardized to one system (Title Case) in place
of the live site's mix of ALL CAPS ("SHMIRAH VOL 1") and Title Case, per the
brief's naming-consistency requirement; this is the one deliberate change
from the source data. Categories match the real site exactly: Rings,
Necklaces, Bracelets (no invented "Ready to Wear" category; the live
site's version of that category wasn't sampled). Only 15 of ~45 real
products are in the catalog so far; add the rest through `/admin` rather
than editing code now that the CMS exists.

## Next steps / backlog

Gap-analysis done 2026-09-10 against "a true, standalone, editable,
strong-backend e-commerce site." Verified end-to-end via a real
chrome-devtools purchase (Buy Now &rarr; Stripe &rarr; webhook &rarr; order &rarr;
inventory flip, see "Checkout / payments" above): the core loop works.
Everything below is a real, known gap, not a hypothetical, prioritized
by how much it matters before real customers use the site. A launch
readiness pass started 2026-09-11 (plan at
`.claude/plans/i-am-not-sure-steady-clover.md`) is working through this
list in stages; items it has already closed are marked done below rather
than deleted, so the audit trail stays intact.

### 🔴 Launch-blockers

- [ ] **Stripe account branding**: the connected account shows
  "Dishboard" (a different project) as the merchant name at checkout.
  Fix by either creating a dedicated Stripe account for AKH, or
  renaming this account's public business name in Stripe Dashboard &rarr;
  Settings &rarr; Business. Confirmed via a real screenshot of the hosted
  checkout page; not cosmetic, every customer sees this.
- [ ] **Go live**: swap the test-mode `STRIPE_SECRET_KEY` for a real
  one once the branding above is fixed, and register a second,
  live-mode webhook (the current one only covers test mode).
- [x] Rotate `ADMIN_TOKEN` off its placeholder value (done 2026-09-11,
  locally in `.env.local` and on Vercel; also cut the login cookie's
  lifetime from 30 days to 7).
- [ ] **Custom domain**: still on `akh-jewelry.vercel.app`, not
  `akhjewelry.com`. Not really "standalone" on a Vercel subdomain.
- [ ] **Terms & Privacy page is a stub** (`/admin/pages/terms`
  literally says "This page will host AKH's full terms..."). Real
  legal exposure to sell before this is written for real. In progress
  as Stage 2 of the launch readiness plan.
- [ ] **No order confirmation/shipping emails**: Stripe's own receipt
  is the only thing a customer gets today; nothing branded from AKH,
  no "your order shipped" email when `/admin/orders` marks it shipped.
  Explicitly deferred (no email provider set up yet).
- [ ] **Supabase project is explicitly temporary** ("until I give you a
  new account," the user's own words): the entire catalog and order
  history lives there until it moves to a permanent project.

### 🟡 Real gaps for "strong backend"

- [ ] No refund/cancel flow in `/admin/orders`: refunds require going
  into the Stripe Dashboard directly. Planned as Stage 4.
- [ ] No quantity/stock counts: only In Stock / Made to Order / Out of
  Stock. Fine for one-of-a-kind pieces, wrong for reproducible ones
  (e.g. Veg Ring) where a second sale today wouldn't auto-block.
  Planned as Stage 5.
- [ ] No customer accounts: guest checkout only, no order-history login.
- [x] No data-rights tooling for GDPR/CCPA/Israeli PPL requests
  (export/erase by email): planned as Stage 3; also not yet built.
- [ ] No error monitoring: decided to rely on Vercel's own logs instead
  of Sentry for now.
- [ ] No automated tests: every regression this session was caught by
  manual/chrome-devtools QA, not a test suite. A Vitest suite covering
  the pure decision logic (stock, refunds, anonymization, checkout
  guards) is Stage 6 of the launch readiness plan.
- [ ] No staging environment: deliberately out of scope for now, every
  change goes straight to production.

### 🟢 "Not standalone" specifically

- [x] **Legacy product photos hotlinked to Wix's CDN**
  (`static.wixstatic.com`) for the original 15 seeded products. Fixed
  2026-09-11 (Stage 1 of the launch readiness plan): `npm run
  migrate:images` (`scripts/migrate-legacy-images.ts`) downloaded each
  product's ORIGINAL Wix file (not the cropped `/v1/fill/...` display
  URL, so no crop got baked in), re-hosted all 36 images plus the 2
  Pexels mood photos (`home`/`story`'s shared hero shot and `bespoke`'s)
  into Supabase Storage, and updated `products.images[]` and the
  relevant `pages` rows. Verified: 0 rows left with a bare Wix id.
  Re-running the script is safe; it skips any `images[]` entry that's
  already a Storage URL.
- [ ] Nav menu structure is hardcoded (`Header.tsx`'s `NAV`,
  `Footer.tsx`'s `COLUMNS`): can't add/rename/reorder nav links from
  `/admin` (a full nav editor was explicitly scoped out of the CMS
  expansion; see that section above).
- [x] Newsletter signup was a no-op stub (`NewsletterForm.tsx`) that
  collected nothing while implying it worked. Deleted 2026-09-11 rather
  than wired up, since there is no email provider to send to yet; the
  footer points at the studio email instead. Revisit once real
  transactional email exists.

### ⚪ Longer-term / nice-to-have

- [ ] Real multi-item cart (currently deliberate "Buy Now per product"
  scope, per the user's own decision; revisit only if the shop
  outgrows single-item checkout).
- [ ] Discount/promo codes, abandoned-cart recovery.
- [ ] Journal/blog, campaigns/announcement bar, roles & permissions,
  localization, site search, analytics dashboard: all explicitly
  scoped out of the CMS expansion's P0 (see that section above).
- [ ] Per-page SEO fields (title/meta description are hardcoded in
  code today, only the product page has dynamic SEO), sitemap.xml.
  Note: no cookie-consent banner is currently needed (no analytics, no
  tracking cookies, self-hosted fonts; see the privacy policy once
  Stage 2 ships), but adding Google Analytics or similar later would
  create that requirement.
- [ ] Create the first real collection(s) through `/admin/collections`:
  the entity exists and is wired end-to-end but starts empty.
- [ ] Replace Pexels mood photography with real AKH studio photography
  once shot (Stage 1 re-hosted the Pexels images into Supabase Storage,
  see above, but didn't replace them with real studio shots).
- [ ] Extend the locked button/type system from the homepage to
  shop/product/policy pages (currently only the homepage and the
  shared `PurchaseArea` component use the new primary/secondary button
  system).
- [ ] Stronger brand story content, real testimonials/press (current
  testimonials are illustrative placeholder quotes, not tied to real
  named customers or photos), full bespoke request form.
- [ ] Wishlist/abandoned-cart wiring, and pulling in the rest of the
  live catalog (only 15 of ~45 real products are seeded so far; add
  more through `/admin/products`).

### House rule: no em dashes or en dashes, anywhere

Applies to code, comments, copy, docs and commit messages, no exceptions.
`npm run no-dashes` checks `src/`, `scripts/`, `supabase/` and this file
and exits non-zero on any hit (see `scripts/no-dashes.sh`). Run it before
committing; CI does not enforce this yet.
