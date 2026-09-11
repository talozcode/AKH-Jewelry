"use client";

import { useState, useTransition } from "react";
import type { SiteSettings } from "@/lib/site-settings";
import { updateSiteSettingsAction } from "./actions";

const inputClass =
  "mt-1 w-full rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text)] outline-none focus:border-[var(--admin-accent-soft)] focus:ring-1 focus:ring-[var(--admin-accent-soft)]";
const textareaClass = inputClass + " min-h-24";

function field(label: string, input: React.ReactNode) {
  return (
    <label className="block">
      <span className="block text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">{label}</span>
      {input}
    </label>
  );
}

export function SiteSettingsForm({ settings: initial }: { settings: SiteSettings }) {
  const [settings, setSettings] = useState(initial);
  const [saving, startSaving] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => setSettings((s) => ({ ...s, [key]: value }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startSaving(async () => {
      const result = await updateSiteSettingsAction(settings);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      {field("Contact email", <input type="email" className={inputClass} value={settings.contactEmail} required onChange={(e) => set("contactEmail", e.target.value)} />)}
      {field("Phone (optional)", <input className={inputClass} value={settings.contactPhone ?? ""} onChange={(e) => set("contactPhone", e.target.value)} />)}
      {field("WhatsApp number (optional)", <input className={inputClass} value={settings.whatsappNumber ?? ""} onChange={(e) => set("whatsappNumber", e.target.value)} />)}
      {field("Instagram URL (optional)", <input className={inputClass} value={settings.instagramUrl ?? ""} onChange={(e) => set("instagramUrl", e.target.value)} />)}
      {field("TikTok URL (optional)", <input className={inputClass} value={settings.tiktokUrl ?? ""} onChange={(e) => set("tiktokUrl", e.target.value)} />)}
      {field("Footer blurb", <textarea className={textareaClass} value={settings.footerBlurb} required onChange={(e) => set("footerBlurb", e.target.value)} />)}

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
    </form>
  );
}
