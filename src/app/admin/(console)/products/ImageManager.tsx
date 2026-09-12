"use client";

import { useState, useTransition } from "react";
import { wixImg } from "@/lib/wixImage";
import { ConfirmDialog } from "../_components/ConfirmDialog";
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
  // Index of the photo pending removal confirmation, or null when no
  // confirmation is open. An index (not a boolean) because this list
  // renders one Remove button per photo.
  const [confirmingRemove, setConfirmingRemove] = useState<number | null>(null);

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
          <div key={img + i} className="relative w-28 rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={wixImg(img, 300, 375)} alt="" className="h-32 w-full rounded object-cover" />
            <div className="mt-1 flex items-center justify-between text-xs text-[var(--admin-text-muted)]">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1.5 disabled:opacity-30">
                ←
              </button>
              <span>{i + 1}</span>
              <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} className="p-1.5 disabled:opacity-30">
                →
              </button>
            </div>
            <button
              type="button"
              onClick={() => setConfirmingRemove(i)}
              className="mt-1 w-full rounded-md border border-[var(--admin-border)] py-0.5 text-xs text-[var(--admin-text-muted)] hover:border-[var(--admin-danger-border)] hover:text-[var(--admin-danger)]"
            >
              Remove
            </button>
          </div>
        ))}
        <label className="flex h-32 w-28 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-[var(--admin-border-strong)] text-center text-xs text-[var(--admin-text-faint)] hover:border-[var(--admin-border-strong)]">
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
      {error ? <p className="mt-2 text-sm text-[var(--admin-danger)]">{error}</p> : null}
      <p className="mt-2 text-xs text-[var(--admin-text-faint)]">
        First photo is the primary image shown on the shop grid and homepage. Photos are resized to
        1800px on upload.
      </p>
      <ConfirmDialog
        open={confirmingRemove !== null}
        title="Remove this photo?"
        description="It comes off this product. Nothing is deleted for good until you press Save changes - Cancel here or leave the page to keep it."
        confirmLabel="Remove photo"
        onConfirm={() => {
          if (confirmingRemove !== null) remove(confirmingRemove);
          setConfirmingRemove(null);
        }}
        onCancel={() => setConfirmingRemove(null)}
      />
    </div>
  );
}
