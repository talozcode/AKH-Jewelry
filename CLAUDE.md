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

## What's built (Phase 1 — Conversion Essentials)

- Homepage (`src/app/page.tsx`): hero, featured collection, brand story,
  shop-by-category, craftsmanship, bespoke steps, testimonials, final CTA
- Shop (`src/app/shop/`): category tabs + full filter set (category, material,
  stone, price, availability, collection), mobile filter drawer, responsive grid
- Product page (`src/app/product/[slug]/page.tsx`): gallery (4 views + zoom),
  full spec block, expandable info accordion, sticky mobile Add to Cart bar,
  curated "you may also like" (max 4), Product + BreadcrumbList JSON-LD
- Supporting pages: `/story`, `/bespoke`, `/faq`, `/contact`,
  `/shipping-returns`, `/care`, `/size-guide`, `/terms`, `/cart` (all functional
  stubs so nav/footer links aren't dead — most need real Phase 2 content)

## What's stubbed / explicitly NOT built yet

- **Checkout/payments**: decided with the user (2026-09-07) to use custom
  Stripe Checkout eventually, but NOT to build it in this pass. "Add to Cart"
  shows a request-sent state and points to `hello@akhjewelry.com`; there is no
  cart state, no payment processing, no order backend.
- **Real photography**: every image is `PlaceholderArt` (`src/components/PlaceholderArt.tsx`),
  a deterministic SVG/gradient placeholder keyed by product motif (ring/necklace/bangle)
  and tone (copper/ink/stone). Swap these for real photos before launch — search
  the codebase for `PlaceholderArt` usages.
- Analytics/conversion tracking, abandoned-cart email, wishlist persistence
  (the heart icon toggles local state only, nothing is saved), search
  (icon is present, not wired), account pages, real newsletter signup (form
  is a no-op stub in `NewsletterForm.tsx`).

## Product data grounding

`src/lib/products.ts` is a placeholder catalog, not a scrape of the live site,
but several names/prices/categories are grounded in the real akhjewelry.com
catalog (pulled 2026-09-07) specifically to demonstrate the brief's naming
standardization: the live site mixes "SHMIRAH VOL 1" and "TSIL bangle" with
Title Case names and no consistent category tagging. This project's catalog
uses one system throughout: Title Case, "[Name] [Type]".

## Next steps (not started)

- Phase 2: stronger brand story content, craftsmanship section with real
  process photography, full bespoke request form, real testimonials/press
- Phase 3: SEO pass, analytics, wishlist/abandoned-cart wiring, editorial
  collection pages
- Wire Stripe Checkout once the user confirms it's time
- Replace `PlaceholderArt` with real photography across every usage
