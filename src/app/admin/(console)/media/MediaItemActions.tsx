"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteSiteMediaAction } from "./actions";

export function MediaItemActions({ id, url, filename }: { id: string; url: string; filename: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function handleDelete() {
    if (!confirm(`Delete "${filename}"? This can't be undone.`)) return;
    startTransition(async () => {
      const result = await deleteSiteMediaAction(id);
      if (result.ok) router.refresh();
    });
  }

  return (
    <div className="flex border-t border-ink/10 text-xs">
      <button type="button" onClick={handleCopy} className="flex-1 py-1.5 text-ink/60 hover:text-ink">
        {copied ? "Copied" : "Copy URL"}
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="flex-1 border-l border-ink/10 py-1.5 text-ink/60 hover:text-red-700 disabled:opacity-50"
      >
        {pending ? "…" : "Delete"}
      </button>
    </div>
  );
}
