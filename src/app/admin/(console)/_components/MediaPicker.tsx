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
      <span className="block text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
      <div className="mt-1 flex items-center gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-14 w-14 rounded-md border border-slate-200 object-cover" />
        ) : (
          <div className="h-14 w-14 rounded-md border border-dashed border-slate-300" />
        )}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          {open ? "Close" : "Choose image"}
        </button>
      </div>

      {open ? (
        <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or paste an image URL"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
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
                  value === asset.url ? "border-slate-900" : "border-transparent"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset.url} alt={asset.filename} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          {assets.length === 0 ? <p className="mt-2 text-xs text-slate-400">No images uploaded to the media library yet.</p> : null}
        </div>
      ) : null}
    </div>
  );
}
