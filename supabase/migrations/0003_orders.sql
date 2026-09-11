-- AKH Jewelry: orders (real Stripe-paid purchases). Separate from
-- reservations (contact-only, no payment) - see CLAUDE.md's Checkout
-- section. A row only ever exists for a session that already succeeded,
-- so `status` here is a fulfillment state, not a payment state.

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  product_slug text not null,
  product_price integer not null,
  product_currency text not null,
  size text,
  customer_name text not null,
  customer_email text not null,
  shipping_line1 text not null,
  shipping_line2 text,
  shipping_city text not null,
  shipping_state text,
  shipping_postal_code text not null,
  shipping_country text not null,
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text,
  amount_total integer not null,
  currency text not null,
  status text not null default 'unfulfilled' check (status in ('unfulfilled', 'shipped')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_status_idx on orders(status);
create index if not exists orders_product_slug_idx on orders(product_slug);

drop trigger if exists orders_set_updated_at on orders;
create trigger orders_set_updated_at before update on orders
  for each row execute function set_updated_at();

alter table orders enable row level security;
