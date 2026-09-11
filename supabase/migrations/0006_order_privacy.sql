-- Backs the data-rights tooling the Privacy Policy promises (access,
-- export, erasure). Orders are anonymized in place rather than deleted:
-- they're financial records with a real tax/accounting retention
-- obligation, and GDPR Art. 17(3)(b) exempts processing required by a
-- legal obligation from the right to erasure. See CLAUDE.md and
-- src/lib/db/privacy.ts for what actually gets erased vs. preserved.

alter table orders add column if not exists anonymized_at timestamptz;

-- Case-insensitive "find everything about this person" is the core
-- operation of every right (access/export/erasure) below.
create index if not exists orders_customer_email_lower_idx on orders (lower(customer_email));
