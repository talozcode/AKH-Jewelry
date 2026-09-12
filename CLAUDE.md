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

## Legal pages: Terms of Sale and Privacy Policy (built 2026-09-11)

`/terms` and `/privacy` are separate pages, each real drafted content
(not boilerplate), grounded in a live audit of what this app actually
does (see the approved plan at
`.claude/plans/i-am-not-sure-steady-clover.md` for the full research
behind each claim). **This is drafted copy, not legal advice, and needs
a lawyer's review in the operating jurisdiction before launch.**

- Both reuse `SectionsContent` (`src/lib/pages.ts`), the same type
  `shipping-returns` already used, now with two added optional fields:
  `intro` and `lastUpdated`. `SectionsForm.tsx` (`pages/_forms/`) takes
  a `pageKey` prop so one form component now serves all three pages.
  Edited at `/admin/pages/terms` and `/admin/pages/privacy`.
- **`src/components/RichText.tsx`**: a server component that renders
  `[link text](url)` inline links within otherwise-plain body text,
  used because a legal document needs to link Stripe's/Supabase's
  policies and a `mailto:`, but the admin has no 2FA/rate-limiting, so
  storing raw HTML (`dangerouslySetInnerHTML`) would turn an admin
  credential leak into stored XSS on a page every storefront page links
  to. Everything that isn't a matched link renders as plain React text
  (React escapes it, so it can't emit a tag); a href is only accepted if
  `new URL()` parses it AND its protocol is `https:`/`http:`/`mailto:`
  (this, not string-prefix matching, is what actually closes
  `javascript:` URLs, including case/tab/percent-encoding variants; see
  `RichText.test.ts`'s `safeHref` tests). A rejected href renders as the
  literal `[text](url)` text instead of a link.
- **Placeholders**: `[[LEGAL ENTITY NAME]]`, `[[REGISTERED ADDRESS]]`,
  `[[COMPANY / VAT NUMBER]]`, `[[EU REPRESENTATIVE NAME AND CONTACT
  DETAILS]]`, `[[GOVERNING LAW JURISDICTION]]`, `[[PRIVACY CONTACT
  EMAIL]]`. Double brackets never collide with `RichText`'s link syntax
  (that needs an immediate following `(`). `/admin/pages` shows a red
  "Unfilled placeholder" pill next to any page whose content still
  contains `[[`, so the owner finds these before a customer does.
- **One item inside the Terms itself is marked `[[LEGAL REVIEW: ...]]`**,
  not a blank placeholder: whether a standard-size Made to Order catalog
  piece qualifies for the same final-sale treatment as a true bespoke
  commission under the EU Consumer Rights Directive's "made to the
  consumer's specifications" exemption. The current live behavior (both
  treated as final sale) is unchanged pending that review; see the plan
  for the reasoning.
- Migration `0005_legal_pages.sql` widened the `pages.key` CHECK
  constraint to add `'privacy'`. The new `terms`/`privacy` content was
  pushed live via a direct `upsert` for just those two keys, not
  `npm run seed:pages` (that upserts every key and would have
  overwritten the owner's edits to unrelated pages, e.g. home/story).
- Deliberately NOT covered this stage: the data-rights mechanisms the
  Privacy Policy promises (access/export/erase by email) don't exist
  yet; that's Stage 3 of the plan, tracked below.

## Data requests: GDPR/CCPA/Israeli PPL tooling (built 2026-09-11)

`/admin/privacy` ("Data requests" in the sidebar) is how the owner
answers an access, export or erasure request. `orders` is currently the
only table holding customer personal data (reservations, the other
candidate, was deleted in Stage 0). See `src/lib/db/privacy.ts` for the
full design reasoning; this is the summary.

- **Look up**: finds every order tied to an email, anonymized or not.
  Deliberately does NOT use Postgres ILIKE for the case-insensitive
  match, even though this stage's migration
  (`0006_order_privacy.sql`) added an index on `lower(customer_email)`
  for exactly that: ILIKE treats `_` as a single-character wildcard,
  and real emails commonly contain a literal underscore, which would
  make an exact-lookup tool occasionally return a stranger's order too.
  Fetches and compares case-insensitively in application code instead,
  correct at this table's current size; verified against a real test
  order at `jane_test@example.com` returning exactly 1 result, not more.
- **Export**: downloads a structured JSON file (GDPR Art. 20 wants
  machine-readable and portable; a flat CSV can't hold this shape).
- **Erase**: anonymizes rather than deletes. Orders are financial
  records with a real tax-retention obligation, and GDPR Art. 17(3)(b)
  exempts processing required by a legal obligation from the right to
  erasure. `buildAnonymizedOrderPatch()` overwrites customer name,
  email and shipping address/city/state/postal code; it preserves
  product, price, currency, size, Stripe IDs, amount, status,
  **`shipping_country`** (kept for VAT/customs record-keeping, per the
  Privacy Policy's retention section) and both timestamps. The erased
  email is per-row unique and non-routable
  (`erased+<id prefix>@akhjewelry.invalid`, RFC 2606's reserved
  `.invalid` TLD). Behind a typed-confirmation input (retype the exact
  email), not a bare `confirm()`, since this is irreversible and mutates
  a financial record; checked again server-side in the action itself,
  not just via the disabled button.
- **Honest caveat, stated in the Privacy Policy itself**:
  `stripe_payment_intent_id` still points at a Stripe record containing
  the customer's name and email, so an anonymized order is
  pseudonymized, not fully anonymous, for as long as Stripe retains its
  own copy. Redacting that is a manual Stripe Dashboard step, not
  something this tool does.
- `buildAnonymizedOrderPatch` is a pure, exported function tested
  against an explicit allowlist of the columns it touches
  (`src/lib/db/privacy.test.ts`), so adding a new personal-data column
  to `orders` later and forgetting to add it there fails that test by
  default rather than shipping a silent compliance gap.
- Verified end-to-end against a real throwaway order (not a fixture):
  looked it up, exported it, erased it, and confirmed in the database
  that the financial columns survived unchanged while identity/contact
  columns were overwritten and `anonymized_at` was stamped.

## Refunds (built 2026-09-11)

A "Refund" link on each unrefunded row in `/admin/orders` refunds the
full order through Stripe. **Full refunds only in v1**, no partial
amounts. No `cancelled` status: a row only ever exists post-payment
(see "Checkout / payments" above), so cancel and refund are the same
act here.

- Migration `0007_order_refunds.sql` widened `orders.status`'s CHECK
  to add `'refunded'` and added `stripe_refund_id`, `refunded_at`,
  `amount_refunded`.
- **The bug this stage would otherwise have introduced**:
  `updateOrderStatusAction` used to accept any `OrderStatus`, so simply
  widening that union would have silently let the owner set `refunded`
  from the plain status dropdown with no money moving. Guarded two
  ways: `SettableOrderStatus` (`src/lib/db/orders.ts`) excludes
  `refunded` at the type level, and `updateOrderStatusAction` itself
  re-checks against an explicit allowlist at runtime, since a request
  to that action isn't actually constrained by what the dropdown's
  `<option>`s happen to be.
- `refundOrderAction` (`admin/orders/actions.ts`) calls
  `stripe.refunds.create({ payment_intent })` **first**, then writes
  the DB. If Stripe succeeds and the DB write then fails, the money
  left and the row is stale, which is visible (the dashboard and
  Stripe disagree) and recoverable via the webhook below; the reverse
  order would show a refund that never happened and produce a
  chargeback. Three layers of double-refund protection: the UI hides
  the Refund control once `status === "refunded"`; the action re-reads
  the order server-side via the pure `canRefund()` guard (the UI check
  goes stale across two open tabs); and the Stripe idempotency key is
  scoped to the order id and its exact charged amount, so two
  concurrent clicks can't both succeed at Stripe. `canRefund()` also
  rejects an order with no `stripe_payment_intent_id`, a genuinely
  reachable case (the webhook only sets it from `session.payment_intent`,
  which can be absent on an incompletely-processed session), not
  defensive paranoia. Confirmed via a native `confirm()` dialog before
  the request fires, matching the delete-confirmation convention
  already used elsewhere in this admin (products/collections/media).
- **Webhook**: listens for `refund.created`, `refund.updated` and
  `refund.failed` (Stripe's October 2024 webhook update made these fire
  uniformly for every refund type; before that, a synchronous card
  refund only ever fired `charge.refunded`). This is what catches a
  refund the owner issues directly from the **Stripe Dashboard**
  instead of the in-app button; for a refund the in-app button already
  issued, it's an idempotent confirmation, not the only place the
  write happens (`order.stripe_refund_id === refund.id` short-circuits
  a duplicate write). `refund.failed` is logged loudly for manual
  reconciliation rather than auto-reverting the order's status: card
  refunds (this shop's only real payment method today) complete
  synchronously, so a failure arriving after the order was already
  marked refunded would mean Stripe reversed its own earlier success,
  exceptional enough that guessing at a revert isn't the safe default.
  The test-mode webhook endpoint's subscribed events were updated to
  include all three (done directly via the Stripe API with the
  existing secret key, not the dashboard); **the live-mode webhook,
  once registered, will need the same three events added** (see the
  launch-blockers list above).
- **Inventory on refund: prompt, never auto-relist.** A refund is
  issued the moment the customer asks, often while the piece is still
  in transit or already in their hands. `/admin/orders` shows "This
  piece is marked Out of Stock. Relist it?" linking to the product's
  admin edit page for a refunded order whose product is currently Out
  of Stock, rather than ever flipping availability automatically.
- `getRevenueByCurrency` now subtracts `amount_refunded` from
  `amount_total`, so the dashboard's Revenue card is net of refunds;
  `getOrderCountsByStatus` gained a `refunded` bucket, shown as its own
  dashboard card.
- Verified end-to-end against a real Stripe test-mode PaymentIntent
  (created and confirmed directly via the API, not through the
  checkout UI, since this only needed to test the refund path): issued
  the refund through the real `/admin/orders` UI, confirmed Stripe
  actually shows a succeeded refund object, confirmed the order row's
  DB state (`status`, `amount_refunded`, `stripe_refund_id`,
  `refunded_at`) exactly matches, and confirmed the dashboard's Revenue
  card correctly nets to zero for a single fully-refunded order.

## Real stock quantity (built 2026-09-11)

`products.stock_quantity` is nullable and optional: null means "not
quantity tracked", which is unchanged, existing behavior and needed no
backfill for the 15 seeded products.

| availability | stock_quantity | meaning |
|---|---|---|
| In Stock | null | one of one; flips to Out of Stock on sale (unchanged) |
| In Stock | N > 0 | N units; decrements per sale, flips at 0 |
| Made to Order | (any) | unbounded, never flipped (unchanged) |

The full decision is a pure, tested function,
`decideInventoryEffect()` in `src/lib/products.ts` (`products.test.ts`
covers the whole table), so the webhook handler itself is just "call
the decided effect," not a place where this logic can drift.

- **The oversell race is real, so this needed the codebase's first
  Postgres function.** Two buyers can create Checkout Sessions for the
  last unit concurrently and both pay, since Stripe imposes no
  serialization between separate sessions. Decrementing at session
  creation (instead of at payment) was rejected: `checkout.session.expired`
  cleanup has up to a 24h default window, so one visitor who abandons
  checkout would lock the last unit for up to a day, a worse and far
  more frequent failure than a rare genuine double-sale. `supabase/
  migrations/0008_product_stock.sql`'s `decrement_product_stock(p_product_id)`
  does the decrement and the `WHERE stock_quantity > 0` check in one
  atomic statement; under READ COMMITTED, a second concurrent call
  blocks on the row lock, then re-evaluates its WHERE against the
  now-updated row and matches zero rows. That row-level lock is the
  entire race fix. Calling it requires a hand-edit to `database.types.ts`'s
  `Functions` block (previously `Record<string, never>`).
- When the decrement returns null on a tracked product (already at 0),
  the customer has already paid, so the webhook must **never throw**:
  it logs loudly and sets `orders.oversold = true`, shown as a red flag
  on that row in `/admin/orders`, so the owner learns about it from the
  dashboard rather than from the customer.
- Replaced the webhook's old `updateProduct(id, {...product, availability})`
  with a narrow `setProductAvailability(id, availability)`
  (`src/lib/products.ts`). The old call wrote every column from a
  `product` read moments earlier, so a concurrent admin edit to that
  same product between the read and the write got silently clobbered:
  a pre-existing lost-update bug, fixed here essentially for free.
- `/admin/products` gets a "Stock quantity (optional)" field, shown
  only when Availability is "In Stock" and cleared automatically when
  switching away from it, so a stale tracked count never sits unused
  underneath a Made to Order or Out of Stock product.
- Storefront shows "Last one" at `stock_quantity === 1` and nothing for
  higher counts (`ProductCard.tsx`): a running count reads like fast
  fashion, against the locked design brief's restraint.
- **Verified end-to-end against real concurrency, not just sequentially**:
  created a throwaway In Stock product with `stock_quantity = 1`, then
  fired two genuinely concurrent fake `checkout.session.completed`
  webhook deliveries at a local dev server (signed with
  `Stripe.webhooks.generateTestHeaderString`, no real Checkout Session
  needed since only the decrement path was under test) via
  `Promise.all`. Confirmed exactly one order succeeded
  (`oversold = false`), the other was correctly flagged
  (`oversold = true`), `stock_quantity` landed at exactly 0 (never
  negative), and the product flipped to Out of Stock. Also verified the
  admin form's Stock quantity field and the storefront's "Last one"
  badge live in a real browser.

## Tests (built 2026-09-11, expanded via an adversarial edge-case pass 2026-09-11)

`npm test` (Vitest, `vitest.config.ts`; `npm run test:watch` while
developing). 86 tests across 11 files. No test touches a real Supabase
or Stripe call.

**The strategy, not just the file list**: `supabaseAdmin()` and
`stripeClient()` are hard to mock cleanly (supabase-js's chained query
builder especially), and the choice here was to extract the pure
decision out of each feature and test that directly, rather than
hand-build a fake of supabase-js's builder (untested code asserting its
own behavior) or refactor working payment/DB code purely for
testability. This is why several features (privacy, refunds, stock,
checkout) each ended up with a plain exported function living next to
their DB/action code: `mergePageContent` (`src/lib/pages.ts`),
`safeEqual`/`tokenMatches` (`src/lib/admin/cookie.ts`,`auth.ts`),
`safeHref`/`isExternalHref` (`src/components/RichText.tsx`), `canRefund`/
`sessionToOrderRow`/`isDuplicateSessionError` (`src/lib/db/orders.ts`),
`buildAnonymizedOrderPatch` (`src/lib/db/privacy.ts`),
`decideInventoryEffect`/`setProductAvailability` (`src/lib/products.ts`),
`checkPurchasable`/`buildCheckoutParams` (`src/lib/checkoutParams.ts`,
pulled out of `src/lib/actions/checkout.ts` specifically because a
`"use server"` file can only export async Server Actions, so plain
synchronous helpers can't live there even when they're exactly the
logic worth testing).

**`isExternalHref`** (`src/components/RichText.tsx`) decides whether a
validated link gets `target="_blank"`/`rel="noreferrer"`. It exists as
its own function, separate from `safeHref`, because of a real bug an
edge-case pass found: `safeHref` accepts a URL based on
`new URL(url).protocol`, which WHATWG normalizes to lowercase, but
returns the href **unchanged**. A link like `[x](HTTPS://example.com)`
was therefore accepted (correctly) but silently rendered with no
`target`/`rel` (incorrectly), since a case-sensitive
`href.startsWith("http")` check missed the uppercase scheme. Fixed with
a case-insensitive `/^https?:/i` test instead, covered by
`RichText.test.ts`'s `isExternalHref` suite.

**One file exercises actual rendered output, not just pure logic**:
`RichText.render.test.ts` calls `RichText({ text })` directly and
inspects the returned React element tree (a plain object graph -
`<a>...</a>` JSX is just `React.createElement`, so no DOM or jsdom is
needed to assert on `.type`/`.props`). This is the one place UI
rendering IS tested, covering multiple/adjacent links, a rejected
link's exact text reconstruction, an empty label, and an unterminated
bracket.

**The one module-boundary mock in the whole suite**: `src/app/api/
webhooks/stripe/route.test.ts` mocks `@/lib/stripe` for exactly two
properties of the webhook's outer guard that can't be exercised as a
pure function: a bad/thrown signature returns 400, and a missing
`STRIPE_WEBHOOK_SECRET` returns 400 without ever calling Stripe.

**Explicitly not tested, and why that's a deliberate line, not a gap
that slipped through**: modules importing `next/headers` (most Server
Actions) don't run outside a real Next request context, so those
wrapper functions aren't unit-testable; `requireAdminAction()`/
`requireAdminPage()` carry no logic of their own beyond calling
`tokenMatches()`, which is tested directly. Client component state/
async races (e.g. the `PrivacyLookupForm` staleness bug found and fixed
below) aren't covered by an automated test either - no
React Testing Library/jsdom is set up in this repo, and adding that
dependency wasn't done reactively as part of a bug fix. No Playwright/
E2E: the purchase path crosses onto `checkout.stripe.com`, whose DOM
Stripe owns and changes without notice, making that kind of test flaky
by construction and expensive for a solo maintainer to keep green;
`chrome-devtools` browser QA against a real deploy (as used throughout
this session) is the deliberate substitute.

**The highest-value single test** is `buildAnonymizedOrderPatch`'s
allowlist assertion (`src/lib/db/privacy.test.ts`): it asserts the
exact set of columns the erasure patch touches, so adding a new
personal-data column to `orders` later and forgetting to add it there
fails that test by default. Every other compliance regression in this
codebase is otherwise invisible until a real data-rights request
surfaces it.

### Edge-case audit (2026-09-11): what an adversarial pass found

After the launch-readiness stages shipped, a batch of new edge-case
tests was written by hand, then 4 parallel agents independently
audited checkout/webhook/stock, privacy/refunds, legal-pages/RichText/
auth, and the no-dashes script/doc accuracy, each running the full
test suite plus adversarial code review. All 4 confirmed the suite
passes; here's what they found and what happened to each finding.

**Fixed:**
- `isExternalHref`'s case-sensitivity bug (above).
- **`PrivacyLookupForm.tsx`'s erase confirmation could target the wrong
  person.** `canErase`/`handleErase` compared `confirmEmail` against the
  live search-box `email` state, not `summary.email` (what's actually
  displayed), and the async lookup had no staleness guard against an
  out-of-order response. A specific sequence (retype the search box, or
  a slower earlier lookup resolving after a faster later one) could
  leave the erase button armed against a person other than the one
  on-screen. Fixed: erase now always targets `summary.email`, and a
  `lookupSeq` ref discards any lookup response that isn't the most
  recently *started* one, regardless of network ordering. Not covered
  by an automated test (see "Explicitly not tested" above); verify by
  hand before relying on it under real concurrent admin usage.
- `checkPurchasable` (`src/lib/checkoutParams.ts`) now validates `size`
  against `product.availableSizes`. `createCheckoutSession` is a Server
  Action, callable directly with any string regardless of what
  `PurchaseArea.tsx`'s UI actually offers; an invalid size had no
  financial impact (price doesn't depend on it) but would have landed
  verbatim in the Stripe line-item description and `orders.size`.
  Covered by new tests in `checkoutParams.test.ts`.
- **No unique constraint on `stripe_payment_intent_id`.** One Checkout
  Session should map to exactly one order, but nothing enforced it;
  if two order rows ever shared a payment_intent (a data-import bug, a
  manual SQL fix), `refundOrderAction`'s idempotency key (scoped to
  order id, not payment_intent) would not catch a double-refund
  against the same underlying Stripe charge from the two different
  rows. Fixed with a partial unique index,
  `supabase/migrations/0009_order_payment_intent_unique.sql`
  (`where stripe_payment_intent_id is not null`, since multiple orders
  legitimately have a null one).
- `proxy.ts`'s login-route exemption used `pathname.startsWith("/admin/login")`;
  tightened to an exact `===` match so a future route merely starting
  with that string (e.g. `/admin/login-history`) can't silently inherit
  the auth bypass. Not currently exploitable (no such route exists),
  fixed anyway since it was a one-line change.
- Duplicate React `key={section.heading}` in `/terms`, `/privacy` and
  `/shipping-returns`: two sections sharing an identical heading (
  nothing in `SectionsForm.tsx` prevents this) would produce a
  duplicate-key console warning. Switched to the array index.
- The no-dashes guard (see "House rule" below) was widened after the
  audit found it only checked the two literal em/en dash codepoints,
  missing 9 visually-identical lookalikes.

**Documented, not fixed** (real gaps, but each needs more than a
one-line change, and none has fired in this project's actual, still-
small order volume):
- **A product deleted between "Buy Now" and webhook delivery means the
  paid order is never recorded at all**, not even a partial row: the
  webhook needs the live product row to build the order snapshot
  (`product_name`/`price`/etc.), and if `getProductById` returns
  nothing it logs and returns before any insert. The customer has
  already been charged. No error-monitoring/alerting exists to
  surface this (an already-accepted gap), and no reconciliation sweep
  exists to recover it. A real fix would mean snapshotting product
  data into the Checkout Session's own metadata at creation time, so
  the webhook never needs to re-fetch a possibly-deleted product.
- **An exception thrown partway through the webhook's inventory effect
  (the `setProductAvailability`/`decrement_product_stock` calls) isn't
  flagged anywhere**, unlike the deliberately-tested oversell path
  (`newQty === null`, which does set `orders.oversold`). A transient
  Supabase error at exactly that moment would leave the order inserted
  but the inventory effect silently un-applied.
- **A refund webhook event arriving before its order row exists is
  permanently dropped, not retried**: `getOrderByPaymentIntentId`
  returning nothing is treated as "an unrelated charge," which can't be
  distinguished from "our own checkout webhook for this payment hasn't
  landed yet." Low probability (needs the checkout webhook to be
  meaningfully delayed relative to a fast dashboard refund) but
  currently unmitigated.
- A narrow, sub-second window exists between the stock-decrement RPC
  and the following `setProductAvailability("Out of Stock")` call
  where a concurrent admin restock edit could be immediately
  overwritten. Very low probability, two non-atomic statements would
  need to become one.
- Product price still has no server-side positivity check (documented
  as a known gap since Stage 6; confirmed still true and now also
  explicitly tested in `checkoutParams.test.ts`, which asserts the
  current, unguarded behavior rather than claiming it's correct).
- The `/admin/pages` list originally flagged pages containing an
  unfilled `[[PLACEHOLDER]]` with a red warning pill. Removed 2026-09-11
  per explicit owner feedback ("too confusing... you can publish with
  the placeholders, i will remove"): pages have no draft/publish
  workflow, so having a placeholder still live is expected and fine
  until the owner gets to it. Every row now shows a plain "Published"
  status pill instead, matching what pages actually are.

## Admin theme: light and dark, light matching the storefront exactly (built 2026-09-11)

The admin console (everything under `/admin`, including the login
page) has its own light/dark theme, independent of the storefront
(which has no theme toggle and never will, per the locked design
brief). Built per explicit owner feedback that the admin "just floating
box at the moment" needed real visual design, and specifically that
light mode should be the storefront's own palette, not a generic
slate/white admin-dashboard look.

- **Tokens**: `src/app/globals.css`, two blocks scoped under
  `[data-admin-theme="light"]` / `[data-admin-theme="dark"]` (`--admin-bg`,
  `--admin-surface`, `--admin-text`, `--admin-accent`, `--admin-danger`,
  etc., plus a separate `--admin-sidebar-*` set: the sidebar keeps its
  own dark anchor - Deep Olive in light mode, one shade darker than the
  main surface in dark mode - rather than flattening to match the
  content area). **Light reuses the storefront's exact hex values**
  (Warm Bone/Deep Olive/Sage Olive/Soft Black/Aged Brass from the
  locked palette at the top of this file); **dark is a considered,
  hand-picked inversion**, not an auto-inverted one - Aged Brass
  becomes the dark-mode accent color, since flat Deep Olive on a
  near-black surface read muddy in practice.
- Every admin component uses these tokens via Tailwind arbitrary values
  (`bg-[var(--admin-surface)]`, etc.) rather than hardcoded `slate-*`/
  `white` classes. Danger/success/warning/info states (red/emerald/
  amber "sky"-ish tones) stay recognizable status colors rather than
  being folded into the earthy palette, since scannability matters more
  than strict on-brand purity for e.g. a refund/error state, but each
  still has its own light/dark pair so it reads correctly in both modes.
- **`ThemeToggle.tsx`** (in the Sidebar): persists the choice to
  `localStorage` (`akh-admin-theme`) and applies it by setting
  `data-admin-theme` directly on `<html>`. Deliberately built on
  `useSyncExternalStore`, not `useState`+`useEffect`: reading a value
  that lives outside React without that hook trips
  `react-hooks/set-state-in-effect`, and the naive fix (a plain
  `useState` seeded from `document.documentElement` at render time)
  would hydration-mismatch, since the server has no `localStorage` to
  read. `useSyncExternalStore`'s `getServerSnapshot` returns a stable
  `"light"` for the server render, and a tiny module-level pub-sub
  (`listeners`) is what makes the toggle button's own click notify
  `useSyncExternalStore` to re-render - it does NOT know a value it
  reads changed unless something calls back into it explicitly.
- **No flash of the wrong theme**: a `next/script` with
  `strategy="beforeInteractive"` (in `(console)/layout.tsx` and
  `admin/login/page.tsx`, which sits outside that layout and needs its
  own copy) reads `localStorage` and sets `data-admin-theme` on `<html>`
  before the page becomes interactive. A plain `<script>` tag doesn't
  work for this: React warns ("Scripts inside React components are
  never executed when rendering on the client") the moment that tree is
  ever reconciled on the client rather than streamed as literal HTML by
  the browser's own parser, which `beforeInteractive` is Next's actual
  documented mechanism for. Because this script mutates `<html>` (an
  element the ROOT layout, shared with the storefront, renders) before
  hydration, `suppressHydrationWarning` on that `<html>` tag
  (`src/app/layout.tsx`) is required too - the standard, narrow escape
  hatch for exactly this pattern (the same one `next-themes` uses),
  not a blanket suppression.

## Mobile responsiveness (audited and fixed 2026-09-11)

Both the storefront and the admin console are now checked for mobile
usability, not just "doesn't horizontally scroll." Done per explicit
owner request ("make the website and dashboard mobile friendly. deploy
agents to audit mobile view and verify"): 4 parallel read-only agents
audited storefront core pages, storefront content/legal pages, admin
tables/forms, and admin dashboard/page-forms/settings/login, each
grepping for fixed-pixel widths, undersized tap targets, and desktop-only
grid assumptions, then every real finding was fixed and live-verified at
a 375x812 viewport with chrome-devtools.

- **Admin had no mobile nav at all before this pass.** `Sidebar.tsx` was
  a static, always-rendered 240px-wide column with no responsive
  handling - below `lg` it ate most of a phone's screen. It's now a
  hamburger-triggered off-canvas drawer below `lg` (`fixed` + a
  `-translate-x-full`/`translate-x-0` toggle, a `bg-black/40` backdrop
  that closes on tap, auto-closes on navigation via React's "adjust
  state during render" pattern comparing `pathname` to a tracked
  `prevPathname` rather than `useEffect`+`setState`, which would trip
  `react-hooks/set-state-in-effect`) and the original always-visible
  static sidebar at `lg` and above, unchanged.
- **Sticky "Buy Now" bar on `/product/[slug]` scrolled its own target
  under the sticky header.** `StickyMobileBar` links to `#purchase`;
  without `scroll-mt-20` on that target, the anchor lands flush under
  the 64px sticky `Header`, hiding the name/price/size-selector the tap
  was meant to reveal. Also added `env(safe-area-inset-bottom)` padding
  to the bar itself so it doesn't crowd the home-indicator area on
  notched iPhones.
- **Small tap targets** bumped to a real hit box across both surfaces:
  `Header`'s cart/hamburger icons (`-m-2 p-2`), `ProductCard`'s wishlist
  heart (`h-8 w-8` -> `h-10 w-10`), and every bare-text "Remove"/reorder
  (`←`/`→`/`↑`/`↓`) button in the admin's repeating-block forms
  (`ImageManager`, `ProductPicker`, `BespokeForm`, `FaqForm`,
  `SectionsForm`, `SimpleListForm`, `SizeGuideForm`) - most had zero
  vertical padding, making the tap area only as tall as the glyph.
- **`SizeGuideForm`'s two-input row could clip off-screen**, not just
  look cramped: two `w-full` text inputs as direct children of a `flex`
  row (not a grid) hit the browser's intrinsic per-input minimum width
  (~170-190px each) before `width:100%` can shrink them further, so at
  375px the second input and the Remove button could render past the
  visible edge with no scrollbar to reveal them (`overflow-x-hidden` on
  `<main>` hides it entirely). Fixed with `flex-col sm:flex-row` plus
  `min-w-0` on each input.
- **Desktop-only 2-column grids** switched to `grid-cols-1 sm:grid-cols-2`
  where content didn't fit: `ProductForm`'s 12-field grid (long hint
  text was wrapping into 5+ lines in a ~139px column) and `HomeForm`'s
  CTA-label pair.
- **Form footer button rows** (`ProductForm`, `CollectionForm`: Save +
  Cancel + a right-aligned Delete link) changed from a single `flex
  justify-between` row (buttons could wrap mid-word at 375px) to
  `flex-col ... sm:flex-row sm:justify-between`, so they stack cleanly
  below `sm`.
- **Dashboard revenue card** could silently clip its value (no visible
  overflow indicator, since `Card` sets `overflow-hidden`) at the
  2-column mobile width once real revenue figures exist. Value text
  now `text-xl sm:text-3xl` with `truncate` as a safety net.
- Confirmed already correct and left alone: every admin data table
  (`products`, `collections`, `orders`) was already `overflow-x-auto`
  wrapping a `min-w-[...]` table - the right pattern, scoped to this
  session before the audit began; `ShopClient`'s mobile filter drawer;
  `Header`'s mobile nav drawer; all storefront legal/content pages
  (responsive padding and headline sizes were already in place from the
  Stage 2 legal-pages work).

## Admin friendliness for a non-technical owner (built 2026-09-12)

The owner who actually runs this admin console is not technical. Built
per her direct question ("is there anything we should do to make the
backend more friendly/easier for her?"), verified with 3 parallel
read-only audit agents against the implementation.

- **Friendly error messages** (`src/lib/admin/friendlyError.ts`,
  `friendlyDbError()`): every admin server action used to hand a caught
  exception's raw `.message` straight to the UI - a duplicate-slug save
  could show `duplicate key value violates unique constraint
  "products_slug_key"` verbatim. `friendlyDbError()` is a pure function
  that pattern-matches the common Postgres/Supabase failure shapes
  (unique/not-null/foreign-key/check constraint violations, JWT/network
  failures) to a plain-English sentence, with a single generic reassuring
  fallback ("Something went wrong saving this...") for anything
  unrecognized - it never echoes raw driver text. Applied in every
  `actions.ts` catch block across products/collections/pages/orders/
  privacy/site-settings/media, and to the two non-exception Supabase
  Storage/DB result errors in the upload actions. Deliberately NOT
  applied to hand-written validation strings the actions already
  construct themselves ("Enter an email address", "Order not found") -
  those are already meant for a human. Tested directly
  (`friendlyError.test.ts`) since it's a pure function extracted for
  exactly that reason, per this file's own Tests-section strategy.
- **In-page confirmation dialogs** (`_components/ConfirmDialog.tsx`)
  replace every native browser `confirm()` for a destructive action
  (delete product/collection/media, remove a photo from a product,
  refund an order) - a native `confirm()` renders as grey system chrome
  outside the site's own design, which can read as a computer error
  rather than a normal part of the page. Portals to `document.body`
  (`OrderRow` renders one per table row, and a `<div>` isn't valid HTML
  directly inside a `<tr>`). Genuinely modal, not just visually so: opens
  with focus on Cancel (the safe default), Escape closes it, Tab/Shift+Tab
  cycle only between its own two buttons rather than leaking into the
  page behind the backdrop, and focus returns to whichever button
  triggered it once it closes. Cancel and the backdrop are both disabled
  while an action is mid-flight, so "cancelling" can't be clicked while
  something irreversible is already in progress. `ImageManager`'s
  per-photo Remove is confirmed too, but scoped honestly: removing a
  photo there only changes the form's local state until "Save changes"
  is pressed, so its dialog says so rather than claiming it "can't be
  undone" like the others.
- **"Slug (URL)" field replaced with a read-only preview**
  (`_components/SlugField.tsx`): a technical concept (a URL-safe string)
  used to sit right next to "Name" as a freely editable input with
  nothing explaining what breaks if it's typed wrong. It's still
  auto-generated from the name; this just stops presenting it as
  something to fill in by default, showing "/product/actual-slug" as
  plain read-only text with a small "Change the web address" link to
  reveal the real input for the rare case someone wants to override it.
  "Use the automatic web address" (shown while editing) actually resets
  to `slugify(name)` and clears the touched flag, matching what its own
  label promises, rather than just toggling the view. Because the
  read-only preview mode has no `<input required>` in the DOM for the
  browser to validate, both `ProductForm` and `CollectionForm` also
  check `form.slug.trim()` explicitly in `handleSubmit` before saving.
- **`/admin/help`**: a short, plain-language "how do I..." page (add a
  piece, mark sold out, edit page text, handle an order/refund, what an
  Oversold flag means, where Media differs from a product's own photos),
  linked from the Sidebar. Every claim in it was checked against the
  actual code it describes (button labels, exact behavior) rather than
  written from memory - the previous draft claimed "photo deletion always
  asks to confirm first" before `ImageManager`'s Remove actually did.

## Owner-managed Stripe credentials (built 2026-09-12)

Built for a genuine handover scenario: the owner asked how she'd ever
control Stripe herself once the developer is "out of the picture." Before
this, `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` were Vercel env vars on a
project only the developer's account has access to - if she needed to
rotate a compromised key or switch Stripe accounts after a full handover,
she'd have no way to do it at all.

- **`src/lib/crypto/secrets.ts`**: `encryptSecret`/`decryptSecret`
  (AES-256-GCM, a fresh random IV per call, authenticated so a tampered
  ciphertext throws instead of silently decrypting to garbage) and
  `maskSecret` (a one-way "sk_live_5…wXyz" fingerprint, safe to redisplay,
  never reversible). Keyed by `SETTINGS_ENCRYPTION_KEY` - a **static**
  secret the developer sets once (via `openssl rand -base64 32`) and never
  needs the owner to touch again, unlike the Stripe values themselves
  which she genuinely needs to be able to rotate. All three functions are
  pure and directly tested (`secrets.test.ts`), including a tamper test
  that flips ciphertext bytes and asserts decryption throws.
- **`src/lib/stripeSettings.ts`**: reads/writes two new nullable column
  pairs on `site_settings` (migration `0010_stripe_settings.sql`) -
  `stripe_secret_key_ciphertext`/`_preview`/`_updated_at` and the same
  three for the webhook secret. Deliberately its own module, not folded
  into `site-settings.ts`: that module's `SiteSettings` type is read by
  public storefront pages (Footer, `/contact`) and should never carry
  anything security-sensitive near it, even indirectly.
  `resolveStripeSecretKey()`/`resolveStripeWebhookSecret()` (used only by
  `stripeClient()` and the webhook route) prefer whatever the owner has
  set over the developer's env var, so setting a key in the admin takes
  effect immediately with no redeploy. `getStripeCredentialsStatus()`
  (admin UI only) never returns a real secret, only the masked preview.
- **`stripeClient()` is now async** (`src/lib/stripe.ts`) since resolving
  the key can mean a database read - every call site
  (`checkout.ts`, `order/success/page.tsx`, `orders/actions.ts`'s
  `refundOrderAction`, the webhook route) now awaits it.
- **`/admin/site-settings`** gained a "Payments" section
  (`StripeSettingsForm.tsx`): two write-only password inputs (secret key,
  webhook signing secret) that always start empty and are never
  pre-filled with a real value - only the masked preview and an
  "updated \<date\>" line show what's currently set. A `ConfirmDialog`
  sits in front of Save (danger=false, but real-money stakes: a bad paste
  breaks checkout for real customers), and the candidate secret key is
  test-called against Stripe (`balance.retrieve()`) **before** it's ever
  persisted, so a typo or wrong-key paste fails immediately with a plain
  message instead of silently breaking the next real checkout.
  `looksLikeStripeSecretKey`/`looksLikeStripeWebhookSecret` (`stripe.ts`)
  reject an obviously wrong prefix (e.g. a publishable `pk_` key pasted
  into the secret field) before that Stripe call even happens.
- **What still can't move into the admin**: registering the webhook
  endpoint itself has to happen in the owner's own Stripe Dashboard
  (Stripe only issues a signing secret once a URL is registered there) -
  everything after that (pasting the resulting `whsec_...` value) lives
  in the friendly UI, but that one step is unavoidably Stripe-side.
- **Honest tradeoff, stated plainly rather than glossed over**: the
  decrypted key only ever exists in server memory, but the *ciphertext*
  sits in a database the single shared admin password can (indirectly,
  via this app) cause to be decrypted - a downgrade from "only in
  Vercel's encrypted env store, only the developer can see it." Judged
  acceptable for a one-owner boutique shop with no other users, not a
  general recommendation.

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
  live-mode webhook (the current one only covers test mode) subscribed
  to `checkout.session.completed`, `refund.created`, `refund.updated`
  and `refund.failed` (all four; see "Refunds" below for why the last
  three exist).
- [x] Rotate `ADMIN_TOKEN` off its placeholder value (done 2026-09-11,
  locally in `.env.local` and on Vercel; also cut the login cookie's
  lifetime from 30 days to 7).
- [ ] **Custom domain**: still on `akh-jewelry.vercel.app`, not
  `akhjewelry.com`. Not really "standalone" on a Vercel subdomain.
- [x] **Terms & Privacy page was a stub** (`/admin/pages/terms`
  literally said "This page will host AKH's full terms..."). Fixed
  2026-09-11 (Stage 2 of the launch readiness plan): split into
  `/terms` (Terms of Sale) and `/privacy` (Privacy Policy), each real
  drafted content covering GDPR/CCPA/Israeli PPL, editable at
  `/admin/pages/terms` and `/admin/pages/privacy`. See "Legal pages"
  below. **Still blocking real launch**: every `[[PLACEHOLDER]]` in
  both pages needs filling before going live (a red "Unfilled
  placeholder" pill on `/admin/pages` flags which ones remain), and the
  made-to-order return/withdrawal question flagged inside the Terms
  content itself needs actual legal review, not just drafted language.
- [ ] **No order confirmation/shipping emails**: Stripe's own receipt
  is the only thing a customer gets today; nothing branded from AKH,
  no "your order shipped" email when `/admin/orders` marks it shipped.
  Explicitly deferred (no email provider set up yet).
- [ ] **Supabase project is explicitly temporary** ("until I give you a
  new account," the user's own words): the entire catalog and order
  history lives there until it moves to a permanent project.

### 🟡 Real gaps for "strong backend"

- [x] **No refund/cancel flow in `/admin/orders`** existed; refunds
  required going into the Stripe Dashboard directly. Fixed 2026-09-11
  (Stage 4): a "Refund" button on each order calls Stripe, then writes
  the DB, full refunds only. See "Refunds" below.
- [x] **No quantity/stock counts** existed; only In Stock / Made to
  Order / Out of Stock, which was fine for one-of-a-kind pieces but
  wrong for reproducible ones (e.g. Veg Ring), where a second sale
  wouldn't auto-block. Fixed 2026-09-11 (Stage 5): an optional real
  `stock_quantity` per product, atomically decremented at payment. See
  "Real stock quantity" below.
- [ ] No customer accounts: guest checkout only, no order-history login.
- [x] **No data-rights tooling for GDPR/CCPA/Israeli PPL requests**
  existed. Fixed 2026-09-11 (Stage 3): `/admin/privacy` ("Data
  requests") looks up every order for an email, exports it as JSON, and
  erases it behind a typed-confirmation ("Data requests" section
  below). Verified end-to-end against a real throwaway order, including
  the underscore-in-email edge case the implementation is specifically
  designed to get right (see below).
- [ ] No error monitoring: decided to rely on Vercel's own logs instead
  of Sentry for now.
- [x] **No automated tests** existed; every regression this session was
  caught by manual/chrome-devtools QA. Fixed 2026-09-11 (Stage 6): a
  Vitest suite (86 tests across 11 files as of the edge-case audit
  below), covering every pure decision
  extracted during Stages 0-5 plus the webhook's outer guard logic. See
  "Tests" below. Not a claim of full coverage: UI rendering and the
  actual Stripe/Supabase calls still aren't tested, by design (see that
  section for why).
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

### House rule: no em dashes, en dashes, or their Unicode lookalikes, anywhere

Applies to code, comments, copy, docs and commit messages, no exceptions.
`npm run no-dashes` checks `src/`, `scripts/`, `supabase/` and this file
and exits non-zero on any hit (see `scripts/no-dashes.sh`). Widened
2026-09-11 after an adversarial audit found the original check (only
the two literal em/en dash codepoints) trivially defeatable: it now
also catches 9 visually-identical lookalikes (horizontal bar, minus
sign, figure/non-breaking hyphen, fullwidth hyphen-minus, small/two-em/
three-em dash) that an editor's autocorrect or an LLM's own output can
introduce without anyone intending a "real" em/en dash. Ordinary ASCII
hyphen-minus is never flagged. Run it before committing; **CI does not
enforce this yet** - a commit with a dash or lookalike can still slip
through today, since the only gate is remembering to run it by hand.

## Launch checklist: what only the site owner can do

Everything above this point can be (and was) built without the real
business behind AKH. These items can't: they need a decision or a
credential that only the owner has, not more engineering. Go live only
after all of these are done, not just the launch-blockers above them.

- [ ] **Fill every `[[PLACEHOLDER]]`** in `/terms` and `/privacy`:
  legal entity name, registered address, company/VAT number, governing
  law jurisdiction, and a privacy contact email. `/admin/pages` shows a
  red pill on both rows until every one is gone.
- [ ] **Get the made-to-order return question legally reviewed.** The
  Terms page itself carries an inline `[[LEGAL REVIEW: ...]]` note on
  whether a standard-size Made to Order catalog piece qualifies for the
  same final-sale treatment as a true bespoke commission under the EU
  Consumer Rights Directive. This is a real compliance question, not a
  copy placeholder, and needs an actual answer from a lawyer in the
  operating jurisdiction before EU customers can be sold to safely.
- [ ] **Appoint an EU representative** if selling to EU/EEA customers
  (GDPR Art. 27): the current worldwide shipping policy was kept
  deliberately, with this representative requirement flagged as a
  pre-launch to-do rather than restricting shipping or silently
  ignoring the requirement. Once appointed, replace the
  `[[EU REPRESENTATIVE NAME AND CONTACT DETAILS]]` placeholder in
  `/privacy`.
- [ ] **Fix Stripe's connected-account branding**: it currently shows
  "Dishboard" (a different project) as the merchant name at checkout,
  confirmed via a real screenshot. Either create a dedicated Stripe
  account for AKH or rename this account's public business name in
  Stripe Dashboard &rarr; Settings &rarr; Business.
- [ ] **Go live on Stripe**: after the branding fix above, swap
  `STRIPE_SECRET_KEY` (`.env.local` and Vercel) for a real live-mode
  key, and register a **second, live-mode webhook** endpoint (the
  existing one only covers test mode) subscribed to all four events:
  `checkout.session.completed`, `refund.created`, `refund.updated`,
  `refund.failed`. Then update `STRIPE_WEBHOOK_SECRET` to match the new
  endpoint's signing secret.
- [ ] **Cut over the custom domain**: still on
  `akh-jewelry.vercel.app`, not `akhjewelry.com`. Point the real domain
  at this Vercel project once the owner is ready to retire the old Wix
  site.
- [ ] **Decide on the "temporary" Supabase project**: it was explicitly
  marked temporary by the owner ("until I give you a new account") and
  still holds the entire live catalog and order history. Moving it is
  a re-provision plus a data/asset copy, not a code rewrite, but it
  needs the owner to actually provide the permanent account.
