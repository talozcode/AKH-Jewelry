-- Lets the site owner rotate her own Stripe credentials from
-- /admin/site-settings instead of needing Vercel access - the whole point
-- being that a full handover (owner takes over, developer steps away)
-- shouldn't leave her unable to ever replace a payment-processor key.
--
-- Ciphertext columns hold AES-256-GCM output, encrypted application-side
-- with SETTINGS_ENCRYPTION_KEY before it ever reaches Postgres (see
-- src/lib/crypto/secrets.ts) - never plaintext, and RLS bypassed via the
-- service key wouldn't help an attacker without that separate key too.
-- Preview columns hold a short masked fingerprint (e.g. "sk_live_5…wXyz"),
-- safe to redisplay in the admin UI so the owner can confirm which key is
-- active without the real secret ever being sent back to the browser.
alter table site_settings
  add column if not exists stripe_secret_key_ciphertext text,
  add column if not exists stripe_secret_key_preview text,
  add column if not exists stripe_secret_key_updated_at timestamptz,
  add column if not exists stripe_webhook_secret_ciphertext text,
  add column if not exists stripe_webhook_secret_preview text,
  add column if not exists stripe_webhook_secret_updated_at timestamptz;
