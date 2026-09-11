"use client";

import { useState, useTransition } from "react";
import { updatePageAction } from "../actions";
import type { PageContent, PageKey } from "@/lib/pages";

export const inputClass =
  "mt-1 w-full rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text)] outline-none focus:border-[var(--admin-accent-soft)] focus:ring-1 focus:ring-[var(--admin-accent-soft)]";
export const textareaClass = inputClass + " min-h-24";

export function field(label: string, input: React.ReactNode, hint?: string) {
  return (
    <label className="block">
      <span className="block text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">{label}</span>
      {input}
      {hint ? <span className="mt-1 block text-xs text-[var(--admin-text-faint)]">{hint}</span> : null}
    </label>
  );
}

/** Shared save-state hook every page form uses. */
export function usePageSave<K extends PageKey>(pageKey: K, initial: PageContent<K>) {
  const [content, setContent] = useState<PageContent<K>>(initial);
  const [saving, startSaving] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function save() {
    setError(null);
    setSaved(false);
    startSaving(async () => {
      const result = await updatePageAction(pageKey, content);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return { content, setContent, save, saving, error, saved };
}

export function SaveBar({ saving, saved, error }: { saving: boolean; saved: boolean; error: string | null }) {
  return (
    <div className="flex items-center gap-3 border-t border-[var(--admin-border)] pt-6">
      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-[var(--admin-accent)] px-6 py-2.5 text-sm font-medium text-[var(--admin-accent-text)] transition hover:bg-[var(--admin-accent-hover)] disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
      {saved ? <span className="text-sm font-medium text-[var(--admin-success)]">Saved</span> : null}
      {error ? <span className="text-sm text-[var(--admin-danger)]">{error}</span> : null}
    </div>
  );
}
