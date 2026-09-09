"use client";

import { useState, useTransition } from "react";
import { wixImg } from "@/lib/wixImage";
import { uploadProductImageAction } from "./actions";

export function ImageManager({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const [uploading, startUpload] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File) {
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    startUpload(async () => {
      const result = await uploadProductImageAction(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onChange([...images, result.url]);
    });
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...images];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function remove(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((img, i) => (
          <div key={img + i} className="relative w-28 border border-ink/15 bg-ivory-deep/40 p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={wixImg(img, 300, 375)} alt="" className="h-32 w-full object-cover" />
            <div className="mt-1 flex items-center justify-between text-xs text-ink/60">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="disabled:opacity-30">
                ←
              </button>
              <span>{i + 1}</span>
              <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} className="disabled:opacity-30">
                →
              </button>
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              className="mt-1 w-full border border-ink/15 py-0.5 text-xs text-ink/60 hover:border-red-700 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        ))}
        <label className="flex w-28 h-32 cursor-pointer flex-col items-center justify-center border border-dashed border-ink/25 text-center text-xs text-ink/50 hover:border-ink/50">
          {uploading ? "Uploading…" : "+ Add photo"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
      <p className="mt-2 text-xs text-ink/50">
        First photo is the primary image shown on the shop grid and homepage. Photos are resized to
        1800px on upload.
      </p>
    </div>
  );
}
