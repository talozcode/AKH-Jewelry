"use client";

import { useState, useTransition } from "react";
import type { StripeCredentialsStatus } from "@/lib/stripeSettings";
import { ConfirmDialog } from "../_components/ConfirmDialog";
import { updateStripeCredentialsAction } from "./actions";

const inputClass =
  "mt-1 w-full rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text)] outline-none focus:border-[var(--admin-accent-soft)] focus:ring-1 focus:ring-[var(--admin-accent-soft)]";

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function StatusLine({ label, status }: { label: string; status: StripeCredentialsStatus["secretKey"] }) {
  if (status.configuredByOwner) {
    const date = formatDate(status.updatedAt);
    return (
      <p className="mt-1 text-xs text-[var(--admin-success)]">
        {label} set: <span className="font-mono">{status.preview}</span>
        {date ? ` (updated ${date})` : ""}
      </p>
    );
  }
  if (status.usingEnvFallback) {
    return <p className="mt-1 text-xs text-[var(--admin-text-faint)]">Not set here yet - using the site&apos;s default configuration for now.</p>;
  }
  return <p className="mt-1 text-xs text-[var(--admin-danger)]">Not configured. Checkout and refunds won&apos;t work until this is set.</p>;
}

/**
 * Write-only by design: both fields always start empty, and a saved value
 * is never redisplayed - only a short masked preview
 * (getStripeCredentialsStatus()'s "sk_live_5…wXyz" style fingerprint) comes
 * back from the server, so the real secret is never sent to the browser a
 * second time after the moment it's typed in. A confirmation step sits in
 * front of Save because a wrong paste here breaks real checkout for real
 * customers, not just a cosmetic setting.
 */
export function StripeSettingsForm({ status: initialStatus }: { status: StripeCredentialsStatus }) {
  const [status, setStatus] = useState(initialStatus);
  const [secretKey, setSecretKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [saving, startSaving] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const hasInput = secretKey.trim().length > 0 || webhookSecret.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasInput) return;
    setError(null);
    setSaved(false);
    setConfirming(true);
  }

  function handleConfirm() {
    startSaving(async () => {
      const result = await updateStripeCredentialsAction({
        secretKey: secretKey.trim() || undefined,
        webhookSecret: webhookSecret.trim() || undefined,
      });
      setConfirming(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setStatus(result.status);
      setSecretKey("");
      setWebhookSecret("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      <label className="block">
        <span className="block text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">Stripe secret key</span>
        <input
          type="password"
          autoComplete="off"
          className={inputClass}
          placeholder="sk_live_..."
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
        />
        <StatusLine label="Secret key" status={status.secretKey} />
      </label>

      <label className="block">
        <span className="block text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">Webhook signing secret</span>
        <input
          type="password"
          autoComplete="off"
          className={inputClass}
          placeholder="whsec_..."
          value={webhookSecret}
          onChange={(e) => setWebhookSecret(e.target.value)}
        />
        <StatusLine label="Webhook secret" status={status.webhookSecret} />
      </label>

      <p className="text-xs text-[var(--admin-text-faint)]">
        Get these from your own Stripe account: Developers → API keys for the secret key, and Developers →
        Webhooks → your endpoint for the signing secret. Leave a field blank to leave it unchanged.
      </p>

      <div className="flex items-center gap-3 border-t border-[var(--admin-border)] pt-6">
        <button
          type="submit"
          disabled={saving || !hasInput}
          className="rounded-md bg-[var(--admin-accent)] px-6 py-2.5 text-sm font-medium text-[var(--admin-accent-text)] transition hover:bg-[var(--admin-accent-hover)] disabled:opacity-50"
        >
          {saving ? "Checking with Stripe…" : "Save payment settings"}
        </button>
        {saved ? <span className="text-sm font-medium text-[var(--admin-success)]">Saved</span> : null}
        {error ? <span className="text-sm text-[var(--admin-danger)]">{error}</span> : null}
      </div>

      <ConfirmDialog
        open={confirming}
        title="Update Stripe payment settings?"
        description="This changes how the site charges customers and processes refunds. Make sure you copied the value correctly from your Stripe Dashboard before continuing."
        confirmLabel="Save payment settings"
        danger={false}
        pending={saving}
        onConfirm={handleConfirm}
        onCancel={() => setConfirming(false)}
      />
    </form>
  );
}
