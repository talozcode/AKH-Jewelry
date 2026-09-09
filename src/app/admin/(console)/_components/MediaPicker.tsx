"use client";

import { useState } from "react";
import type { MediaAsset } from "@/lib/media";

/**
 * A flat thumbnail-grid picker over the media library, plus a raw-URL
 * input as an escape hatch (matches wixImg()'s existing pass-through-any-
 * URL behavior). No search/folders — fine at today's upload volume.
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
      <span className="block text-xs uppercase tracking-[0.08em] text-ink/50">{label}</span>
      <div className="mt-1 flex items-center gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-14 w-14 border border-ink/15 object-cover" />
        ) : (
          <div className="h-14 w-14 border border-dashed border-ink/25" />
        )}
        <button type="button" onClick={() => setOpen((v) => !v)} className="border border-ink/20 px-3 py-2 text-sm hover:border-ink">
          {open ? "Close" : "Choose image"}
        </button>
      </div>

      {open ? (
        <div className="mt-3 border border-ink/15 p-3">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or paste an image URL"
            className="w-full border border-ink/20 bg-ivory px-3 py-2 text-sm outline-none focus:border-ink"
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
                className={`aspect-square overflow-hidden border ${value === asset.url ? "border-charcoal" : "border-ink/10"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset.url} alt={asset.filename} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          {assets.length === 0 ? <p className="mt-2 text-xs text-ink/50">No images uploaded to the media library yet.</p> : null}
        </div>
      ) : null}
    </div>
  );
}
