-- Lets the owner rotate her own admin login password from
-- /admin/site-settings, same handover motivation as migration 0010's
-- Stripe credentials: today ADMIN_TOKEN is a Vercel env var only the
-- developer's account can reach.
--
-- Unlike the Stripe credentials (reversibly encrypted, since stripeClient()
-- needs the real value to call Stripe), this is a genuine login password -
-- stored as a one-way scrypt hash (see src/lib/crypto/password.ts), never
-- reversible even by this app itself.
alter table site_settings
  add column if not exists admin_password_hash text,
  add column if not exists admin_password_updated_at timestamptz;
