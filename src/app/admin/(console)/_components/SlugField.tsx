"use client";

import { useId, useState } from "react";

/**
 * "Slug" is a technical concept (a URL-safe string) that used to sit right
 * next to "Name" as a freely editable text input, with nothing explaining
 * what breaks if it's typed wrong. It's auto-generated from the name
 * already; this just stops presenting it as something to fill in by
 * default. Shown as a read-only preview of the real web address, with a
 * small link to reveal the editable field for the rare case someone
 * actually wants to change it.
 */
export function SlugField({
  value,
  onChange,
  onManualEdit,
  onResetToAutomatic,
  prefix,
  inputClassName,
}: {
  value: string;
  onChange: (value: string) => void;
  onManualEdit: () => void;
  /** Called when the owner switches back off manual editing - restores
   *  auto-generation from the Name field going forward, matching what the
   *  toggle button's own label ("Use the automatic web address") promises. */
  onResetToAutomatic: () => void;
  prefix: string;
  inputClassName: string;
}) {
  const [editing, setEditing] = useState(false);
  // Not a <label>: there's no single form control it would correctly bind
  // to (a read-only <p> preview when collapsed, an <input> only once
  // editing). Associated to the input via aria-labelledby instead, so the
  // input still gets a real accessible name ("Web address") once it exists.
  const labelId = useId();

  return (
    <div className="block">
      <span id={labelId} className="block text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
        Web address
      </span>
      {editing ? (
        <input
          aria-labelledby={labelId}
          className={inputClassName}
          value={value}
          required
          onChange={(e) => {
            onManualEdit();
            onChange(e.target.value);
          }}
        />
      ) : (
        <p className="mt-1 truncate rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-2 text-sm text-[var(--admin-text-muted)]">
          {prefix}
          {value || "…"}
        </p>
      )}
      <button
        type="button"
        onClick={() => {
          if (editing) onResetToAutomatic();
          setEditing((v) => !v);
        }}
        className="mt-1 py-1 text-xs text-[var(--admin-text-faint)] underline underline-offset-2 hover:text-[var(--admin-text)]"
      >
        {editing ? "Use the automatic web address" : "Change the web address"}
      </button>
    </div>
  );
}
