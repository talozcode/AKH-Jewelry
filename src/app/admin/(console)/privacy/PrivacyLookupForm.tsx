"use client";

import { useRef, useState, useTransition } from "react";
import type { PersonalDataSummary } from "@/lib/db/privacy";
import { erasePersonalDataAction, exportPersonalDataAction, lookupPersonalDataAction } from "./actions";

export function PrivacyLookupForm() {
  const [email, setEmail] = useState("");
  const [summary, setSummary] = useState<PersonalDataSummary | null>(null);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [erased, setErased] = useState<number | null>(null);
  const [looking, startLookup] = useTransition();
  const [exporting, startExport] = useTransition();
  const [erasing, startErase] = useTransition();
  // Guards against an out-of-order response: if the admin fires a second
  // lookup (or retypes the email) before an earlier one resolves, only the
  // most recently STARTED lookup's result is ever applied to the screen,
  // regardless of which network response lands first.
  const lookupSeq = useRef(0);

  function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setErased(null);
    setConfirmEmail("");
    const thisLookup = ++lookupSeq.current;
    startLookup(async () => {
      const result = await lookupPersonalDataAction(email);
      if (thisLookup !== lookupSeq.current) return; // a newer lookup has since started; discard this stale response
      if (!result.ok) {
        setError(result.error);
        setSummary(null);
        return;
      }
      setSummary(result.summary);
    });
  }

  function handleExport() {
    setError(null);
    startExport(async () => {
      const result = await exportPersonalDataAction(email);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const blob = new Blob([result.json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `akh-personal-data-${email.trim().toLowerCase().replace(/[^a-z0-9]/g, "-")}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  function handleErase() {
    if (!summary) return;
    setError(null);
    // Erase whatever email the ON-SCREEN summary is actually for, never the
    // live search-box `email` state: the two can diverge if the admin
    // retypes the search box after a lookup resolves (or while one is still
    // in flight), and erasing by the search box's current value could
    // silently target a different person than the one the confirmation UI
    // is showing.
    const targetEmail = summary.email;
    startErase(async () => {
      const result = await erasePersonalDataAction(targetEmail, confirmEmail);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setErased(result.erasedCount);
      setConfirmEmail("");
      // Re-look-up so the list reflects the now-anonymized rows immediately.
      const thisLookup = ++lookupSeq.current;
      const refreshed = await lookupPersonalDataAction(targetEmail);
      if (thisLookup !== lookupSeq.current) return;
      if (refreshed.ok) setSummary(refreshed.summary);
    });
  }

  const unerased = summary?.orders.filter((o) => !o.anonymized_at) ?? [];
  // Confirmation is checked against summary.email (what's actually
  // displayed and what handleErase will actually target), not the live
  // search-box `email` state - see handleErase's comment for why those two
  // can diverge.
  const canErase = summary !== null && unerased.length > 0 && confirmEmail.trim().toLowerCase() === summary.email.trim().toLowerCase();

  return (
    <div className="space-y-8">
      <form onSubmit={handleLookup} className="flex items-end gap-3">
        <label className="block flex-1 max-w-sm">
          <span className="block text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">Customer email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setSummary(null);
              setErased(null);
            }}
            className="mt-1 w-full rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--admin-accent-soft)] focus:ring-1 focus:ring-[var(--admin-accent-soft)]"
            placeholder="customer@example.com"
          />
        </label>
        <button
          type="submit"
          disabled={looking}
          className="rounded-md bg-[var(--admin-accent)] px-4 py-2 text-sm font-medium text-[var(--admin-accent-text)] hover:bg-[var(--admin-accent-hover)] disabled:opacity-50"
        >
          {looking ? "Looking up…" : "Look up"}
        </button>
      </form>

      {error ? <p className="text-sm text-[var(--admin-danger)]">{error}</p> : null}
      {erased !== null ? (
        <p className="text-sm font-medium text-[var(--admin-success)]">
          Erased {erased} order{erased === 1 ? "" : "s"} for this email.
        </p>
      ) : null}

      {summary ? (
        <div className="space-y-6">
          <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5 shadow-sm">
            <p className="text-sm text-[var(--admin-text-muted)]">
              <span className="font-semibold text-[var(--admin-text)]">{summary.orders.length}</span> order{summary.orders.length === 1 ? "" : "s"} found for{" "}
              <span className="font-medium text-[var(--admin-text)]">{summary.email}</span>
              {unerased.length !== summary.orders.length ? (
                <span className="text-[var(--admin-text-faint)]"> ({summary.orders.length - unerased.length} already erased)</span>
              ) : null}
            </p>

            {summary.orders.length > 0 ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[600px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--admin-border)] text-left text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
                      <th className="py-2 pr-3">Date</th>
                      <th className="py-2 pr-3">Piece</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 pr-3">Erased</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.orders.map((o) => (
                      <tr key={o.id} className="border-b border-[var(--admin-border)] last:border-0">
                        <td className="py-2 pr-3 text-[var(--admin-text-muted)]">{new Date(o.created_at).toLocaleDateString("en-GB")}</td>
                        <td className="py-2 pr-3 text-[var(--admin-text)]">{o.items.map((item) => item.product_name).join(", ") || "no items"}</td>
                        <td className="py-2 pr-3 text-[var(--admin-text-muted)]">{o.status}</td>
                        <td className="py-2 pr-3 text-[var(--admin-text-muted)]">{o.anonymized_at ? new Date(o.anonymized_at).toLocaleDateString("en-GB") : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleExport}
              disabled={exporting || summary.orders.length === 0}
              className="mt-4 rounded-md border border-[var(--admin-border-strong)] px-4 py-2 text-sm text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)] disabled:opacity-50"
            >
              {exporting ? "Preparing…" : "Export as JSON"}
            </button>
          </div>

          {unerased.length > 0 ? (
            <div className="rounded-lg border border-[var(--admin-danger-border)] bg-[var(--admin-danger-bg)] p-5">
              <h2 className="text-sm font-semibold text-[var(--admin-danger)]">Erase this person&apos;s data</h2>
              <p className="mt-1 text-sm text-[var(--admin-danger)]">
                Permanently overwrites name, email and shipping address on {unerased.length} order{unerased.length === 1 ? "" : "s"}. Order and
                payment records are kept for tax purposes; only identity and contact details are erased. This cannot be undone.
              </p>
              <label className="mt-3 block max-w-sm">
                <span className="block text-xs font-medium uppercase tracking-wide text-[var(--admin-danger)]">Type the email address to confirm</span>
                <input
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[var(--admin-danger-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--admin-danger)] focus:ring-1 focus:ring-[var(--admin-danger)]"
                  placeholder={summary.email}
                />
              </label>
              <button
                type="button"
                onClick={handleErase}
                disabled={!canErase || erasing}
                className="mt-3 rounded-md bg-[var(--admin-danger-solid)] px-4 py-2 text-sm font-medium text-[var(--admin-accent-text)] hover:bg-[var(--admin-danger-solid-hover)] disabled:opacity-40"
              >
                {erasing ? "Erasing…" : "Erase permanently"}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
