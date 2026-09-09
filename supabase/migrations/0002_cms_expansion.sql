-- AKH Jewelry CMS expansion: pages, site_settings, collections, media_assets.
-- See CLAUDE.md's "CMS" section for design rationale. Reuses set_updated_at()
-- from 0001_init.sql.

create table if not exists pages (
  key text primary key check (key in (
    'home', 'story', 'bespoke', 'faq', 'shipping-returns', 'care', 'size-guide', 'contact', 'terms'
  )),
  content jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

drop trigger if exists pages_set_updated_at on pages;
create trigger pages_set_updated_at before update on pages
  for each row execute function set_updated_at();

alter table pages enable row level security;

create table if not exists site_settings (
  id integer primary key default 1 check (id = 1),
  contact_email text not null,
  contact_phone text,
  whatsapp_number text,
  instagram_url text,
  tiktok_url text,
  footer_blurb text not null,
  updated_at timestamptz not null default now()
);

insert into site_settings (id, contact_email, footer_blurb)
values (1, 'hello@akhjewelry.com', '')
on conflict (id) do nothing;

drop trigger if exists site_settings_set_updated_at on site_settings;
create trigger site_settings_set_updated_at before update on site_settings
  for each row execute function set_updated_at();

alter table site_settings enable row level security;

create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  tagline text not null,
  intro text not null,
  hero_image_url text not null,
  hero_image_alt text not null,
  story text not null,
  product_slugs text[] not null default '{}',
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists collections_slug_idx on collections(slug);

drop trigger if exists collections_set_updated_at on collections;
create trigger collections_set_updated_at before update on collections
  for each row execute function set_updated_at();

alter table collections enable row level security;

create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  storage_path text not null,
  filename text not null,
  uploaded_at timestamptz not null default now()
);

alter table media_assets enable row level security;
