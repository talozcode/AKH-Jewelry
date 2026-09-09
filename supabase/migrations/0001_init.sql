-- AKH Jewelry CMS: initial schema (products + reservations)
-- See CLAUDE.md "CMS" section for the design rationale.

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text not null check (category in ('Rings','Necklaces','Bracelets')),
  price integer not null,
  currency text not null check (currency in ('ILS','USD')),
  material text not null,
  stone text,
  measurements text not null,
  weight text,
  available_sizes text[],
  availability text not null check (availability in ('In Stock','Made to Order','Out of Stock')),
  dispatch text not null,
  limited_edition text,
  images text[] not null default '{}',
  tagline text not null,
  description text not null,
  story text not null,
  craftsmanship text not null,
  care text not null,
  is_featured boolean not null default false,
  is_hero boolean not null default false,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  product_slug text not null,
  product_price integer not null,
  product_currency text not null,
  size text,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  message text,
  status text not null default 'new' check (status in ('new','contacted','fulfilled','cancelled')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reservations_status_idx on reservations(status);
create index if not exists reservations_product_slug_idx on reservations(product_slug);
create index if not exists products_slug_idx on products(slug);

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_set_updated_at on products;
create trigger products_set_updated_at before update on products
  for each row execute function set_updated_at();

drop trigger if exists reservations_set_updated_at on reservations;
create trigger reservations_set_updated_at before update on reservations
  for each row execute function set_updated_at();

-- RLS on, no policies: the app only ever talks to Supabase via a
-- server-only service-role/secret key (never a browser-side key), so this
-- is defense in depth rather than the primary access control.
alter table products enable row level security;
alter table reservations enable row level security;
