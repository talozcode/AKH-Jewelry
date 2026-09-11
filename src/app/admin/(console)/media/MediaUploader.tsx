"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { uploadSiteMediaAction } from "./actions";

export function MediaUploader() {
  const router = useRouter();
  const [uploading, startUpload] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File) {
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    startUpload(async () => {
      const result = await uploadSiteMediaAction(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div>
      <label className="inline-flex cursor-pointer items-center rounded-md bg-[var(--admin-accent)] px-5 py-2.5 text-sm font-medium text-[var(--admin-accent-text)] hover:bg-[var(--admin-accent-hover)]">
        {uploading ? "Uploading…" : "+ Upload image"}
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
      {error ? <p className="mt-2 text-sm text-[var(--admin-danger)]">{error}</p> : null}
    </div>
  );
}
