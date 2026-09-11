-- Real stock-quantity tracking. Nullable stock_quantity means "not
-- quantity tracked" (today's rule: an "In Stock" one-of-one flips straight
-- to Out of Stock on sale, "Made to Order" is never flipped), so this
-- needs no backfill for the 15 existing products - they all stay
-- null/untracked until the owner opts a specific product into tracking a
-- real count via /admin/products.

alter table products add column if not exists stock_quantity integer;
alter table products add constraint products_stock_quantity_check check (stock_quantity is null or stock_quantity >= 0);

alter table orders add column if not exists oversold boolean not null default false;

-- Atomic decrement, the codebase's first Postgres function. Two buyers can
-- create Checkout Sessions for the last unit concurrently and both pay
-- (Stripe imposes no serialization here), so the decrement has to happen
-- at payment time, inside one atomic statement, not as a separate
-- read-then-write from application code. Under READ COMMITTED, the second
-- concurrent call blocks on the row lock, then re-evaluates its WHERE
-- against the now-updated row and matches zero rows - that row-level lock
-- is the entire race fix. Returns the new quantity, or null if the
-- product isn't tracked (stock_quantity is null) or already had 0 left
-- (an oversell the webhook must flag, never silently ignore or throw on,
-- since the customer has already paid by the time this runs).
create or replace function decrement_product_stock(p_product_id uuid)
returns integer
language plpgsql
as $$
declare
  new_qty integer;
begin
  update products
  set stock_quantity = stock_quantity - 1
  where id = p_product_id and stock_quantity is not null and stock_quantity > 0
  returning stock_quantity into new_qty;

  return new_qty;
end;
$$;
