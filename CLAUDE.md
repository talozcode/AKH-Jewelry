@AGENTS.md

# AKH Jewelry — Redesign

Complete redesign of a friend's jewelry e-commerce site (akhjewelry.com, currently on
Wix). Part of the "talozcode" family of side projects. See the original brief for the
full requirements — this file tracks what's actually built.

## Route structure: `(site)` group + `/design-concepts`

All live-site routes moved under `src/app/(site)/` (a route group — doesn't
affect URLs) with their own `(site)/layout.tsx` owning `<Header/>`/`<Footer/>`.
Root `src/app/layout.tsx` now only sets up `<html>/<body>` and fonts. This
exists so `src/app/design-concepts/page.tsx` — an internal, noindexed page
comparing 4 alternative visual directions for the whole brand, built when the
user said "I am not sure about the design" — can render with NO site chrome
at all (a dark or paper-toned concept next to the live warm-olive Header
would be confusing). If you add a new top-level route that should show
Header/Footer, put it under `(site)/`, matching every existing route.
`design-concepts/` is deliberately outside `globals.css`'s influence — see
its own `_lib/shared-content.ts` (shares real product data across all 4
concepts so nothing drifts) and `_components/Concept{A,B,C,D}.tsx` (each is
fully self-scoped: its own hex consts and, for B/C/D, its own
`next/font/google` loads — never touches the global `--color-*`/`--font-*`
tokens). Don't merge a winning concept's styling into the live site by
hand-copying colors into `globals.css` piecemeal; if one is chosen, do a
deliberate token-system swap and update this doc.

## Why the design looks the way it does (read before restyling)

The first two passes at this site (warm palette aside) still read as a generic
AI-generated template, and the user called that out directly. Two research
agents studied the actual shipped CSS/HTML of real indie-artisan jewelry
sites (Catbird NYC, Wwake, Grainne Morton, Alighieri) to find out what
actually reads as "handmade, worth $300" versus "cheap template". Findings
that changed this codebase:

- **Filled brand-color CTA buttons are a tell.** None of the four reference
  sites fill marketing buttons with a bright accent color — Wwake's button
  "accent color" is literally desaturated grey; the others use plain
  ink-outline or underlined-text buttons and reserve solid fills for the
  true primary commerce action (Add to Cart) in near-black, not a brand hue.
  This codebase now does the same: `border border-ink ... hover:bg-ink
  hover:text-ivory` for marketing CTAs (shop the collection, begin a bespoke
  piece, etc.); only the actual "Add to Cart" button in `PurchaseArea.tsx`
  is filled, and it's filled ink, not copper.
- **A tracked-out uppercase eyebrow label above every section heading is a
  tell.** None of the reference homepages stamp one above each section. This
  codebase no longer does either — check before adding one back.
- **Middle-dot-joined metadata ("Name · Detail") reads as templated
  attribution chrome.** Removed from `ProductCard.tsx` and the homepage
  testimonials.
- **The real differentiator has to come from the actual subject matter**, not
  from a swapped color or font. Alighieri's device is literary Dante quotes;
  Grainne Morton's is visible sketchbook/process ephemera. AKH's equivalent —
  and it was sitting unused in `products.ts` the whole time — is that most
  piece names are real Hebrew words/phrases with real meanings pulled from
  the live site ("Kohl Davar Bezmano" — everything comes in its own time;
  Levone is set with kunzite because that stone fades in daylight, so it's
  made to be worn at night). The product page now surfaces `product.story`
  as a visible pull-quote instead of burying it in an accordion, and the
  homepage brand-story section leads with it instead of generic copy.
- One deliberate moving element (a slow marquee ticker of real process facts,
  motion-reduced for `prefers-reduced-motion`) replaces the "fade-and-slide-up
  on every section" pattern that reads as generated.

If you're about to add an eyebrow label, a filled copper button, or a
`·`-joined caption: don't — that's reverting exactly what this pass fixed.

## Stack

- Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS v4
- Fonts: Fraunces (display serif) + Inter (sans), via `next/font/google`
- No CMS/backend yet — product data is a static array in `src/lib/products.ts`
- No cart/checkout backend yet — see "What's stubbed" below

## Design system

Defined as CSS custom properties in `src/app/globals.css` / Tailwind `@theme`.
**As of 2026-09-07 this is a warm, earthy palette** — deliberately NOT the
cold charcoal/black "dark editorial gallery" look the written brief first
suggested. The user shared real photos of AKH's actual packaging (an olive
satin drawstring pouch, a warm taupe gift box, a blush/kraft shopping bag
with brass-toned ribbon, all under a casual handwritten "akh." wordmark) and
asked for the site to feel like that instead. The token names kept their
original names (`charcoal`, `copper`, etc.) but the hex values were retuned:
`--color-charcoal` is now a warm deep olive-brown (not near-black),
`--color-copper` is now an olive-brass accent (not rust copper). If the brief
document and this real packaging direction ever conflict again, the
packaging direction wins — it's what the actual brand looks like.
The wordmark uses a script font (Caveat, `font-script` utility) matching the
real logo's handwritten mark; Fraunces remains the display serif for
headlines. Do not add new one-off colors — extend this token set instead.

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
  attached to the text-only testimonials). Chosen for warm, sunlit, candid
  tones to match the real packaging direction above — not moody/desaturated.
- The user has real photos of AKH's actual packaging and at least one real
  on-body product shot (shared in chat, not saved as files this session has
  access to). If the user provides them as files/URLs later, prefer them
  over the Pexels placeholders immediately — they're more valuable than any
  stock photo.
- The user also pointed to the real Instagram, @akhjewelry. Firecrawl refuses
  to scrape instagram.com entirely; a general fetch got only the profile's
  visible bio/description, not actual post images. What it confirmed: bio is
  "Handmade & bespoke jewelry, crafted with love and light 🤍", highlights are
  "custom made / process / daily picks / about", and the feed is minimalist,
  soft and lifestyle-driven — individual ring shots and flat-lays styled with
  coffee cups and textured fabric backgrounds, not dark editorial studio
  photography. This reinforces the packaging-driven pivot above (warm/soft
  over dark/moody) rather than changing it further. If a way to actually pull
  their post images turns up later, prefer those over Pexels too.
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
