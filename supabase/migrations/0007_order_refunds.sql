-- Adds refund tracking to orders. No 'cancelled' status: a row only ever
-- exists post-payment (see 0003_orders.sql), so cancel and refund are the
-- same act here. Full refunds only in v1; a later partial-refund feature
-- would use amount_refunded < amount_total rather than a new status.

alter table orders drop constraint if exists orders_status_check;
alter table orders add constraint orders_status_check check (status in ('unfulfilled', 'shipped', 'refunded'));

alter table orders add column if not exists stripe_refund_id text;
alter table orders add column if not exists refunded_at timestamptz;
alter table orders add column if not exists amount_refunded integer not null default 0;
