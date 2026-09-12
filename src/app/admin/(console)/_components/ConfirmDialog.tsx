"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * Replaces the browser's native `confirm()` for destructive admin actions
 * (delete product/collection/media, refund an order). A native confirm()
 * renders as grey system chrome outside the page's own design - to a
 * non-technical owner it can read as a computer error rather than a normal
 * part of the site. This is styled like the rest of the admin instead, and
 * closes on backdrop click same as the mobile Sidebar drawer.
 *
 * Portals to `document.body`: OrderRow renders one of these per table row,
 * and a `<div>` is not valid HTML directly inside a `<tr>` - portalling
 * out avoids that DOM-nesting violation regardless of which ancestor
 * happens to render it. Safe to call unconditionally (no SSR guard
 * needed): every call site starts with `open: false`, and the early
 * `if (!open) return null` below means `document` is never touched during
 * the server render, only after a client interaction sets `open` true.
 *
 * Genuinely modal, not just visually so: on open, focus moves to Cancel
 * (the safe default for a destructive-by-default dialog), Escape closes
 * it, Tab/Shift+Tab cycle only between the two buttons rather than
 * leaking into the page behind the backdrop, and focus returns to
 * whatever triggered the dialog once it closes.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  danger = true,
  pending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCancel();
        return;
      }
      if (e.key !== "Tab") return;
      const first = cancelRef.current;
      const last = confirmRef.current;
      if (!first || !last) return;
      // Only two focusable elements ever live in this dialog, so the trap
      // is just "wrap between them" rather than a general focusable-set scan.
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={pending ? undefined : onCancel}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-full max-w-sm rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="text-base font-semibold text-[var(--admin-text)]">
          {title}
        </h2>
        <p id={descriptionId} className="mt-2 text-sm text-[var(--admin-text-muted)]">
          {description}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-md border border-[var(--admin-border-strong)] px-4 py-2 text-sm text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={
              danger
                ? "rounded-md bg-[var(--admin-danger-solid)] px-4 py-2 text-sm font-medium text-[var(--admin-accent-text)] transition hover:bg-[var(--admin-danger-solid-hover)] disabled:opacity-50"
                : "rounded-md bg-[var(--admin-accent)] px-4 py-2 text-sm font-medium text-[var(--admin-accent-text)] transition hover:bg-[var(--admin-accent-hover)] disabled:opacity-50"
            }
          >
            {pending ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
