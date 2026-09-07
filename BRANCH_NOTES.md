# Branch: design/quiet-objects-of-light

Implements the "AKH Jewelry — Website Design Brief" (quiet, tactile,
earthy, contemporary studio — Ancient Egyptian akh meaning kept
conceptual, not literal). This is a separate branch, not merged to main.

## What changed vs. main

- **Design tokens** (`src/app/globals.css`): swapped to the brief's exact
  hex values — Warm Bone `#F3EFE7` (bg), Stone `#D8D0C3` (alt bg), Deep
  Olive `#34392C` (primary dark / primary button fill), Sage Olive
  `#747861` (brand accent), Khaki `#999174` (secondary accent), Soft Black
  `#20211D` (text), plus a new Aged Brass `#A68C59` token for the small
  metallic accent role (used sparingly — see the "meaning" section label).
  Token *names* are unchanged from main, only values, so every component
  automatically inherits the new palette.
- **Typography**: swapped the display serif from Fraunces to **Cormorant
  Garamond** (the brief's first-choice editorial headline font; EB Garamond
  was the named alternative). Inter stays for body/UI/nav/prices exactly as
  the brief specifies. The handwritten Caveat wordmark is untouched — the
  brief explicitly wants the logo font kept separate from the display font,
  which was already the case.
- **Homepage** (`src/app/(site)/page.tsx`): fully rebuilt to the brief's
  structure and copy — photographic hero ("objects of light." / "Jewelry
  shaped by transformation, time and the beauty of imperfection." / "Shop
  collection →"), selected pieces, a full-bleed editorial photography
  moment, a short concrete studio story, a small quiet "meaning behind the
  name" section (the only place Egyptian symbolism is mentioned, and only
  in prose), and a closing CTA. Trimmed the process ticker, testimonials
  and multi-step craftsmanship/bespoke sections that were on main's
  homepage — the brief says not to overwhelm the homepage with philosophy
  and to let the jewelry and photography lead.
- **Primary button style**: brief specifies a real primary/secondary button
  system (Deep Olive fill / Warm Bone text for primary, transparent +
  thin olive-or-black border for secondary) — a deliberate departure from
  the ink-outline-everywhere convention on main (which came from separate
  Catbird/Wwake/etc. research earlier in this project). Updated the one
  shared component with a true commerce action, `PurchaseArea.tsx` (Add to
  Cart + sticky mobile bar), from black fill to Deep Olive fill so it's
  consistent site-wide. Homepage CTAs use the same primary/secondary system.
  Other pages' secondary CTAs (story/bespoke/cart) were already
  outline-with-black-border, which already matches the brief's secondary
  spec, so left as-is.

## Scope note

Token/font changes apply site-wide automatically (shared theme + shared
components). The homepage content rebuild is the main deliverable per the
brief. Shop/product/policy page *layout* wasn't restructured — they inherit
the new colors and type but keep their existing structure. Say if you want
the primary/secondary button system extended to every remaining button too.
