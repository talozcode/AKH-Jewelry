@AGENTS.md

# AKH Jewelry — Redesign

Complete redesign of a friend's jewelry e-commerce site (akhjewelry.com, currently on
Wix). Part of the "talozcode" family of side projects. See the original brief for the
full requirements — this file tracks what's actually built.

## Stack

- Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS v4
- Fonts: Fraunces (display serif) + Inter (sans), via `next/font/google`
- No CMS/backend yet — product data is a static array in `src/lib/products.ts`
- No cart/checkout backend yet — see "What's stubbed" below

## Design system

Defined as CSS custom properties in `src/app/globals.css` / Tailwind `@theme`:
charcoal (`--color-charcoal`) for dark editorial sections, warm ivory
(`--color-ivory`) for shop/product sections, burnished copper (`--color-copper`)
as the accent, plus stone/mineral neutrals. Do not add new one-off colors —
extend this token set instead.

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
  browsers are unaffected.
- **Editorial/mood photography where no real AKH photo exists** (hero, brand
  story, craftsmanship, bespoke, final CTA) uses curated stock from Pexels —
  see `src/lib/stockImages.ts`. Pexels' license permits free commercial use,
  no attribution required. These are clearly generic mood shots, never
  presented as a specific real person (no fake "founder photo", no photos
  attached to the text-only testimonials).
- The old `PlaceholderArt` SVG-placeholder system from the first pass has been
  removed now that real product photos are wired in.

## What's built (Phase 1 — Conversion Essentials)

- Homepage (`src/app/page.tsx`): hero, featured collection, brand story,
  shop-by-category (real product photos per category), craftsmanship,
  bespoke steps, testimonials, final CTA
- Shop (`src/app/shop/`): category tabs (Rings/Necklaces/Bracelets — matches
  the real site's actual categories) + filter set (category, material, stone,
  price, availability, collection), mobile filter drawer, responsive grid
- Product page (`src/app/product/[slug]/page.tsx`): gallery using however many
  real photos exist for that piece (1–4), click-to-zoom, full spec block,
  expandable info accordion, sticky mobile Add to Cart bar, curated "you may
  also like" (max 4), Product + BreadcrumbList JSON-LD
- Supporting pages: `/story`, `/bespoke`, `/faq`, `/contact`,
  `/shipping-returns`, `/care`, `/size-guide` (EU ring sizing, matching the
  real site), `/terms`, `/cart` (functional stubs, most need real Phase 2 content)

## What's stubbed / explicitly NOT built yet

- **Checkout/payments**: decided with the user (2026-09-07) to use custom
  Stripe Checkout eventually, but NOT to build it in this pass. "Add to Cart"
  shows a request-sent state and points to `hello@akhjewelry.com`; there is no
  cart state, no payment processing, no order backend.
- Analytics/conversion tracking, abandoned-cart email, wishlist persistence
  (the heart icon toggles local state only, nothing is saved), search
  (icon is present, not wired), account pages, real newsletter signup (form
  is a no-op stub in `NewsletterForm.tsx`).

## Product data grounding

`src/lib/products.ts` is a REAL catalog — 15 of the live site's products
(pulled 2026-09-07), each with its real name, price (₪), material, stone,
and story copy taken from its actual akhjewelry.com product page. Names are
standardized to one system (Title Case) in place of the live site's mix of
ALL CAPS ("SHMIRAH VOL 1") and Title Case, per the brief's naming-consistency
requirement — this is the one deliberate change from the source data.
Categories match the real site exactly: Rings, Necklaces, Bracelets (no
invented "Ready to Wear" category — the live site's version of that category
wasn't sampled).

## Next steps (not started)

- Phase 2: stronger brand story content, real testimonials/press (current
  testimonials are illustrative placeholder quotes, clearly not tied to real
  named customers or photos), full bespoke request form
- Phase 3: SEO pass, analytics, wishlist/abandoned-cart wiring, editorial
  collection pages, and pulling in the rest of the live catalog (only 15 of
  ~45 real products are in `products.ts` so far)
- Wire Stripe Checkout once the user confirms it's time
- Replace Pexels mood photography with real AKH studio photography once shot
