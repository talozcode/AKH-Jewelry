-- Three independent, small additions to the order header, all from the
-- "make this genuinely no-developer-needed" gap audit:
--
-- tracking_number/carrier: once an order ships, there was previously
-- nowhere in this app to even record a tracking number, let alone share
-- it with the customer - she'd have to email it manually, outside the
-- app, every single time.
--
-- special_instructions: a free-text note collected on Stripe's own
-- hosted checkout page (via Checkout Session custom_fields, verified
-- live against Stripe's real API before building on it), for a gift
-- message or an engraving/personalization request - previously nowhere
-- to capture this, so it depended on a separate, unlinked email thread.
-- Session-level, not per-item: Stripe's custom_fields apply to the whole
-- Checkout Session, not to an individual line item, and this app
-- deliberately never built a custom checkout UI (see CLAUDE.md's
-- Checkout section) that could offer a true per-item field instead.
--
-- stripe_dispute_id/dispute_status: a chargeback was previously invisible
-- in this app entirely - only visible in the Stripe Dashboard directly,
-- with nothing here reminding the owner it's happening or that Stripe's
-- evidence deadline is time-boxed. No CHECK constraint on dispute_status:
-- it stores Stripe's own dispute.status values directly, which Stripe
-- could add to over time - a fixed enum here would risk rejecting a
-- valid future value the webhook needs to record.
alter table orders
  add column if not exists tracking_number text,
  add column if not exists carrier text,
  add column if not exists special_instructions text,
  add column if not exists stripe_dispute_id text,
  add column if not exists dispute_status text;
