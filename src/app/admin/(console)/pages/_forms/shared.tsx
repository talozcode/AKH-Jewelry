"use client";

import { useState, useTransition } from "react";
import { updatePageAction } from "../actions";
import type { PageContent, PageKey } from "@/lib/pages";

export const inputClass = "mt-1 w-full border border-ink/20 bg-ivory px-3 py-2 text-sm outline-none focus:border-ink";
export const textareaClass = inputClass + " min-h-24";

export function field(label: string, input: React.ReactNode, hint?: string) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.08em] text-ink/50">{label}</span>
      {input}
      {hint ? <span className="mt-1 block text-xs text-ink/40">{hint}</span> : null}
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
    <div className="flex items-center gap-3 border-t border-ink/10 pt-6">
      <button
        type="submit"
        disabled={saving}
        className="bg-charcoal px-6 py-2.5 text-sm text-ivory transition hover:bg-charcoal-soft disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
      {saved ? <span className="text-sm text-green-700">Saved</span> : null}
      {error ? <span className="text-sm text-red-700">{error}</span> : null}
    </div>
  );
}
