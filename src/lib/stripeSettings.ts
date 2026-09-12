import { decryptSecret, encryptSecret, maskSecret } from "./crypto/secrets";
import { supabaseAdmin } from "./supabase/server";
import type { Database } from "./supabase/database.types";

/**
 * Stripe credential storage, kept deliberately separate from
 * site-settings.ts (contact info, social links, footer copy) even though
 * both read/write the same `site_settings` singleton row: that module's
 * `SiteSettings` type is read by public storefront pages (Footer, /contact)
 * and its `getSiteSettings()` return value has no business ever carrying
 * anything security-sensitive near it, even indirectly.
 *
 * Built so the site owner can rotate her own Stripe API key and webhook
 * signing secret from /admin/site-settings without ever needing Vercel
 * access - the point being a genuine handover (developer steps away
 * entirely) shouldn't leave her unable to ever replace a payment-processor
 * credential. The stored value is always AES-256-GCM ciphertext (see
 * ./crypto/secrets.ts); nothing here ever returns the real secret to a
 * Server Action's result, only a masked preview.
 */

type CredentialStatus = {
  /** True once the owner has set her own value via the admin. */
  configuredByOwner: boolean;
  /** e.g. "sk_live_5…wXyz" - safe to render, never the real value. */
  preview: string | null;
  updatedAt: string | null;
  /** True when nothing's been set in the admin and this falls back to the
   *  developer-configured environment variable instead. */
  usingEnvFallback: boolean;
};

export type StripeCredentialsStatus = {
  secretKey: CredentialStatus;
  webhookSecret: CredentialStatus;
};

type StripeSettingsRow = {
  stripe_secret_key_ciphertext: string | null;
  stripe_secret_key_preview: string | null;
  stripe_secret_key_updated_at: string | null;
  stripe_webhook_secret_ciphertext: string | null;
  stripe_webhook_secret_preview: string | null;
  stripe_webhook_secret_updated_at: string | null;
};

async function readRow(): Promise<StripeSettingsRow | null> {
  const { data, error } = await supabaseAdmin()
    .from("site_settings")
    .select(
      "stripe_secret_key_ciphertext, stripe_secret_key_preview, stripe_secret_key_updated_at, stripe_webhook_secret_ciphertext, stripe_webhook_secret_preview, stripe_webhook_secret_updated_at"
    )
    .eq("id", 1)
    .maybeSingle();
  if (error) throw new Error(`stripeSettings: ${error.message}`);
  return data;
}

/** Admin UI only (/admin/site-settings) - never the real secret. */
export async function getStripeCredentialsStatus(): Promise<StripeCredentialsStatus> {
  const row = await readRow();
  return {
    secretKey: {
      configuredByOwner: Boolean(row?.stripe_secret_key_ciphertext),
      preview: row?.stripe_secret_key_preview ?? null,
      updatedAt: row?.stripe_secret_key_updated_at ?? null,
      usingEnvFallback: !row?.stripe_secret_key_ciphertext && Boolean(process.env.STRIPE_SECRET_KEY),
    },
    webhookSecret: {
      configuredByOwner: Boolean(row?.stripe_webhook_secret_ciphertext),
      preview: row?.stripe_webhook_secret_preview ?? null,
      updatedAt: row?.stripe_webhook_secret_updated_at ?? null,
      usingEnvFallback: !row?.stripe_webhook_secret_ciphertext && Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    },
  };
}

/**
 * Real Stripe usage only - stripeClient() and the webhook route. Prefers
 * whatever the owner has set in the admin over the developer-configured
 * environment variable, so setting it once in /admin/site-settings actually
 * takes effect without a redeploy.
 */
export async function resolveStripeSecretKey(): Promise<string> {
  const row = await readRow();
  if (row?.stripe_secret_key_ciphertext) return decryptSecret(row.stripe_secret_key_ciphertext);
  const envKey = process.env.STRIPE_SECRET_KEY;
  if (envKey) return envKey;
  throw new Error(
    "No Stripe secret key configured. Set one at /admin/site-settings, or STRIPE_SECRET_KEY in .env.local for local development."
  );
}

/** Same fallback order as resolveStripeSecretKey(). Returns null (not a
 *  throw) when neither is set - the webhook route treats that as "not
 *  configured yet" rather than a hard failure worth a stack trace. */
export async function resolveStripeWebhookSecret(): Promise<string | null> {
  const row = await readRow();
  if (row?.stripe_webhook_secret_ciphertext) return decryptSecret(row.stripe_webhook_secret_ciphertext);
  return process.env.STRIPE_WEBHOOK_SECRET ?? null;
}

/**
 * Admin only - call requireAdminAction() before this. Encrypts and stores
 * whichever of the two credentials is provided; omitting one leaves it
 * untouched, so the owner can rotate just the webhook secret without
 * having to re-paste the API key too (and vice versa).
 */
export async function setStripeCredentials(input: { secretKey?: string; webhookSecret?: string }): Promise<void> {
  const patch: Partial<Database["public"]["Tables"]["site_settings"]["Update"]> = {};
  if (input.secretKey) {
    patch.stripe_secret_key_ciphertext = encryptSecret(input.secretKey);
    patch.stripe_secret_key_preview = maskSecret(input.secretKey);
    patch.stripe_secret_key_updated_at = new Date().toISOString();
  }
  if (input.webhookSecret) {
    patch.stripe_webhook_secret_ciphertext = encryptSecret(input.webhookSecret);
    patch.stripe_webhook_secret_preview = maskSecret(input.webhookSecret);
    patch.stripe_webhook_secret_updated_at = new Date().toISOString();
  }
  if (Object.keys(patch).length === 0) return;

  const { error } = await supabaseAdmin().from("site_settings").update(patch).eq("id", 1);
  if (error) throw new Error(`setStripeCredentials: ${error.message}`);
}
