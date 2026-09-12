"use client";

import { useState, useTransition } from "react";
import type { AdminPasswordStatus } from "@/lib/adminPassword";
import { ConfirmDialog } from "../_components/ConfirmDialog";
import { updateAdminPasswordAction } from "./actions";

const inputClass =
  "mt-1 w-full rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text)] outline-none focus:border-[var(--admin-accent-soft)] focus:ring-1 focus:ring-[var(--admin-accent-soft)]";

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Lets the owner change her own /admin/login password. Same write-only
 * shape as StripeSettingsForm - the current status line never shows the
 * password itself, only whether she's rotated it and when.
 */
export function AdminPasswordForm({ status: initialStatus }: { status: AdminPasswordStatus }) {
  const [status, setStatus] = useState(initialStatus);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, startSaving] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const canSubmit = currentPassword.length > 0 && newPassword.length > 0 && confirmPassword.length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match.");
      return;
    }
    setConfirming(true);
  }

  function handleConfirm() {
    startSaving(async () => {
      const result = await updateAdminPasswordAction({ currentPassword, newPassword });
      setConfirming(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setStatus(result.status);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  const updatedDate = formatDate(status.updatedAt);

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      <p className="text-xs text-[var(--admin-text-faint)]">
        {status.customSet
          ? `You've set your own password${updatedDate ? ` (updated ${updatedDate})` : ""}.`
          : "Currently using the default password set up for you. Set your own below any time."}
      </p>

      <label className="block">
        <span className="block text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">Current password</span>
        <input
          type="password"
          autoComplete="current-password"
          className={inputClass}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </label>

      <label className="block">
        <span className="block text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">New password</span>
        <input
          type="password"
          autoComplete="new-password"
          className={inputClass}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <span className="mt-1 block text-xs text-[var(--admin-text-faint)]">At least 8 characters.</span>
      </label>

      <label className="block">
        <span className="block text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">Confirm new password</span>
        <input
          type="password"
          autoComplete="new-password"
          className={inputClass}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </label>

      <div className="flex items-center gap-3 border-t border-[var(--admin-border)] pt-6">
        <button
          type="submit"
          disabled={saving || !canSubmit}
          className="rounded-md bg-[var(--admin-accent)] px-6 py-2.5 text-sm font-medium text-[var(--admin-accent-text)] transition hover:bg-[var(--admin-accent-hover)] disabled:opacity-50"
        >
          {saving ? "Saving…" : "Change password"}
        </button>
        {saved ? <span className="text-sm font-medium text-[var(--admin-success)]">Saved</span> : null}
        {error ? <span className="text-sm text-[var(--admin-danger)]">{error}</span> : null}
      </div>

      <ConfirmDialog
        open={confirming}
        title="Change your admin password?"
        description="You'll need the new password to sign in from now on - make sure you'll remember it before continuing."
        confirmLabel="Change password"
        danger={false}
        pending={saving}
        onConfirm={handleConfirm}
        onCancel={() => setConfirming(false)}
      />
    </form>
  );
}
