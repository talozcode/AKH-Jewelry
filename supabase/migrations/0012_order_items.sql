-- Multi-item cart support: an order can now hold more than one product.
-- `orders` becomes a header row (customer, shipping, totals, status);
-- per-product detail moves to a new `order_items` child table, one row
-- per distinct product+size line in a Checkout Session (quantity > 1 of
-- the same product+size collapses into a single row with that quantity,
-- matching how Stripe's own line items work).
--
-- Existing order history is backfilled as one order_items row per order
-- (quantity 1) before the now-redundant per-product columns are dropped
-- from `orders` - no history is lost, it just moves tables.
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  product_slug text not null,
  unit_amount integer not null,
  size text,
  quantity integer not null default 1 check (quantity > 0),
  -- Moved from orders.oversold: oversold is now a per-item fact (a
  -- multi-item order could have one line item oversold and others fine),
  -- not an order-wide one.
  oversold boolean not null default false,
  created_at timestamptz not null default now()
);

create index order_items_order_id_idx on order_items(order_id);
create index order_items_product_slug_idx on order_items(product_slug);

insert into order_items (order_id, product_id, product_name, product_slug, unit_amount, size, quantity, oversold)
select id, product_id, product_name, product_slug, product_price, size, 1, oversold
from orders;

alter table orders
  drop column product_id,
  drop column product_name,
  drop column product_slug,
  drop column product_price,
  drop column product_currency,
  drop column size,
  drop column oversold;

drop index if exists orders_product_slug_idx;

alter table order_items enable row level security;
