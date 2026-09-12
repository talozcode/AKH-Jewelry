"use server";

import { revalidatePath } from "next/cache";
import Stripe from "stripe";
import { requireAdminAction } from "@/lib/admin/auth";
import { friendlyDbError } from "@/lib/admin/friendlyError";
import { looksLikeStripeSecretKey, looksLikeStripeWebhookSecret } from "@/lib/stripe";
import { getStripeCredentialsStatus, setStripeCredentials, type StripeCredentialsStatus } from "@/lib/stripeSettings";
import { updateSiteSettings, type SiteSettings } from "@/lib/site-settings";

export async function updateSiteSettingsAction(settings: SiteSettings): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminAction();
  try {
    await updateSiteSettings(settings);
    // Header/Footer render on every (site) page via the shared layout.
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? friendlyDbError(err.message) : "Failed to save" };
  }
}

/**
 * Lets the owner set her own Stripe API key and/or webhook signing secret
 * from the admin instead of needing Vercel access. Validates format, then
 * makes a real call to Stripe with the candidate secret key BEFORE ever
 * persisting it - a bad paste (typo, wrong key copied, extra whitespace)
 * should fail loudly here, not silently at the next real checkout. Nothing
 * this returns ever carries a real secret back to the browser: on success
 * it hands back getStripeCredentialsStatus()'s masked preview, the same
 * shape the page loads with.
 */
export async function updateStripeCredentialsAction(input: {
  secretKey?: string;
  webhookSecret?: string;
}): Promise<{ ok: true; status: StripeCredentialsStatus } | { ok: false; error: string }> {
  await requireAdminAction();

  const secretKey = input.secretKey?.trim() || undefined;
  const webhookSecret = input.webhookSecret?.trim() || undefined;

  if (!secretKey && !webhookSecret) {
    return { ok: false, error: "Paste a key or secret before saving." };
  }

  if (secretKey) {
    if (!looksLikeStripeSecretKey(secretKey)) {
      return {
        ok: false,
        error:
          "That doesn't look like a Stripe secret key - it should start with sk_live_ or sk_test_. Copy it again from Stripe Dashboard → Developers → API keys.",
      };
    }
    try {
      // A fresh, throwaway Stripe client for the candidate value only -
      // never through stripeClient(), which reads whatever is already
      // stored/configured, not what's mid-edit in this form.
      await new Stripe(secretKey).balance.retrieve();
    } catch {
      return { ok: false, error: "Stripe rejected that key. Double-check you copied the whole thing, with no extra spaces." };
    }
  }

  if (webhookSecret && !looksLikeStripeWebhookSecret(webhookSecret)) {
    return {
      ok: false,
      error:
        "That doesn't look like a webhook signing secret - it should start with whsec_. Copy it from Stripe Dashboard → Developers → Webhooks → your endpoint.",
    };
  }

  try {
    await setStripeCredentials({ secretKey, webhookSecret });
    revalidatePath("/admin/site-settings");
    const status = await getStripeCredentialsStatus();
    return { ok: true, status };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? friendlyDbError(err.message) : "Failed to save" };
  }
}
