-- Found via adversarial edge-case review: stripe_payment_intent_id had no
-- uniqueness guarantee. One Checkout Session maps to exactly one
-- PaymentIntent and should map to exactly one order row by design, but
-- nothing enforced that. If two order rows ever shared a payment_intent
-- (a data-import bug, a manual SQL fix, etc.), refundOrderAction's
-- idempotency key (scoped to order id, not payment_intent) would NOT
-- catch a double-refund attempt against the same underlying Stripe charge
-- from two different order rows - each row produces its own, distinct
-- idempotency key. A partial index (not a plain unique column) since
-- multiple orders legitimately have a null payment_intent (an order
-- created before the field was populated, or one whose session lacked it).

create unique index if not exists orders_payment_intent_unique
  on orders (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;
