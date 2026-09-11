"use client";

import { useState } from "react";
import type { MediaAsset } from "@/lib/media";

/**
 * A flat thumbnail-grid picker over the media library, plus a raw-URL
 * input as an escape hatch (matches wixImg()'s existing pass-through-any-
 * URL behavior). No search/folders - fine at today's upload volume.
 */
export function MediaPicker({
  label,
  value,
  onChange,
  assets,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  assets: MediaAsset[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <span className="block text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">{label}</span>
      <div className="mt-1 flex items-center gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-14 w-14 rounded-md border border-[var(--admin-border)] object-cover" />
        ) : (
          <div className="h-14 w-14 rounded-md border border-dashed border-[var(--admin-border-strong)]" />
        )}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md border border-[var(--admin-border-strong)] px-3 py-2 text-sm text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)]"
        >
          {open ? "Close" : "Choose image"}
        </button>
      </div>

      {open ? (
        <div className="mt-3 rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-3">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or paste an image URL"
            className="w-full rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--admin-accent-soft)] focus:ring-1 focus:ring-[var(--admin-accent-soft)]"
          />
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
            {assets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => {
                  onChange(asset.url);
                  setOpen(false);
                }}
                className={`aspect-square overflow-hidden rounded-md border-2 ${
                  value === asset.url ? "border-[var(--admin-text)]" : "border-transparent"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset.url} alt={asset.filename} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          {assets.length === 0 ? <p className="mt-2 text-xs text-[var(--admin-text-faint)]">No images uploaded to the media library yet.</p> : null}
        </div>
      ) : null}
    </div>
  );
}
