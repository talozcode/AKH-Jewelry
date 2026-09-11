-- Adds "privacy" as a valid pages.key so the Terms of Sale and Privacy
-- Policy can be separate pages (Stripe and CCPA both expect a dedicated
-- privacy policy URL, and the two documents change for different reasons).
-- Postgres has no "alter check constraint", so drop and recreate it.

alter table pages drop constraint if exists pages_key_check;

alter table pages add constraint pages_key_check check (key in (
  'home', 'story', 'bespoke', 'faq', 'shipping-returns', 'care', 'size-guide', 'contact', 'terms', 'privacy'
));
