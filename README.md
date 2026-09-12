# AKH Jewelry

Next.js storefront + admin CMS for [akhjewelry.com](https://akhjewelry.com), a
one-owner jewelry studio. Live checkout via Stripe, content/inventory managed
entirely through `/admin` - see [`CLAUDE.md`](./CLAUDE.md) for the full build
history, architecture decisions, and current status. That file is the real
reference; this one is just enough to get a fresh clone running.

## Setup

1. `npm install`
2. Copy `.env.local.example` to `.env.local` and fill in real values:
   - `SUPABASE_URL` / `SUPABASE_SECRET_KEY` - from the Supabase project's
     Settings -> API page.
   - `ADMIN_TOKEN` - the password for `/admin/login`; any string works locally.
   - `STRIPE_SECRET_KEY` - a **test-mode** key from the Stripe Dashboard.
   - `STRIPE_WEBHOOK_SECRET` - only obtainable after this app is deployed and
     a webhook endpoint is registered against it in the Stripe Dashboard
     (see `CLAUDE.md`'s "Checkout / payments" section). Local webhook testing
     can use the Stripe CLI (`stripe listen --forward-to
     localhost:3000/api/webhooks/stripe`) instead, which prints its own
     `whsec_...` value for local use.
   - `SETTINGS_ENCRYPTION_KEY` - generate with `openssl rand -base64 32`.
3. `npm run dev`, then open [http://localhost:3000](http://localhost:3000).
   Admin console is at `/admin/login`.

## Scripts

- `npm run dev` / `npm run build` / `npm start`
- `npm run typecheck` / `npm run lint` / `npm test` / `npm run no-dashes`
  (checks for em/en dashes and lookalikes in copy and source - a house
  writing-style rule, see `scripts/no-dashes.sh`)
- `npm run seed` / `npm run seed:pages` - one-time data seeding scripts,
  see their own file headers before running against a populated database
- `npm run migrate:images` - one-time legacy-image migration, see its header

## Database

Migrations live in `supabase/migrations/`, applied by hand (no Supabase CLI
project link in this environment) via `psql` against the project's Session
Pooler connection string. `src/lib/supabase/database.types.ts` is hand-written
and must be updated alongside every migration - there's no `supabase gen
types` codegen step today.
