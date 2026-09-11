-- Reservations was a no-payment enquiry feature, superseded by real
-- Stripe checkout. Confirmed 0 rows before dropping (no historical
-- customer data lost). Its Server Action was also an unauthenticated
-- public write endpoint with zero callers, so removing it entirely is
-- pure attack-surface reduction with no feature loss. See CLAUDE.md.

drop table if exists reservations;
