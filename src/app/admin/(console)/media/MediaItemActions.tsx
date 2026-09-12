"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ConfirmDialog } from "../_components/ConfirmDialog";
import { deleteSiteMediaAction } from "./actions";

export function MediaItemActions({ id, url, filename }: { id: string; url: string; filename: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteSiteMediaAction(id);
      if (!result.ok) {
        setConfirmingDelete(false);
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex border-t border-[var(--admin-border)] text-xs">
        <button type="button" onClick={handleCopy} className="flex-1 py-1.5 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]">
          {copied ? "Copied" : "Copy URL"}
        </button>
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          disabled={pending}
          className="flex-1 border-l border-[var(--admin-border)] py-1.5 text-[var(--admin-text-muted)] hover:text-[var(--admin-danger)] disabled:opacity-50"
        >
          {pending ? "…" : "Delete"}
        </button>
      </div>
      {error ? <p className="border-t border-[var(--admin-border)] px-2 py-1.5 text-xs text-[var(--admin-danger)]">{error}</p> : null}
      <ConfirmDialog
        open={confirmingDelete}
        title={`Delete "${filename}"?`}
        description="This removes the photo from the media library and can't be undone. It stays in place anywhere it's already used until you swap it out there too."
        confirmLabel="Delete photo"
        pending={pending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
