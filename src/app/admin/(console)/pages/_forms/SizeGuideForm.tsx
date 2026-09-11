"use client";

import type { SizeGuideContent } from "@/lib/pages";
import { field, inputClass, textareaClass, usePageSave, SaveBar } from "./shared";

export function SizeGuideForm({ content: initial }: { content: SizeGuideContent }) {
  const { content, setContent, save, saving, error, saved } = usePageSave("size-guide", initial);

  function updateSize(i: number, patch: Partial<SizeGuideContent["sizes"][number]>) {
    setContent((c) => ({ ...c, sizes: c.sizes.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) }));
  }
  function removeSize(i: number) {
    setContent((c) => ({ ...c, sizes: c.sizes.filter((_, idx) => idx !== i) }));
  }
  function addSize() {
    setContent((c) => ({ ...c, sizes: [...c.sizes, { eu: "", circumference: "" }] }));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="space-y-6"
    >
      {field("Heading", <input className={inputClass} value={content.heading} onChange={(e) => setContent((c) => ({ ...c, heading: e.target.value }))} />)}
      {field("Intro", <textarea className={textareaClass} value={content.intro} onChange={(e) => setContent((c) => ({ ...c, intro: e.target.value }))} />)}
      <div>
        <span className="block text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">Size chart</span>
        <div className="mt-2 space-y-2">
          {content.sizes.map((size, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className={inputClass + " mt-0"} placeholder="EU size" value={size.eu} onChange={(e) => updateSize(i, { eu: e.target.value })} />
              <input
                className={inputClass + " mt-0"}
                placeholder="Circumference"
                value={size.circumference}
                onChange={(e) => updateSize(i, { circumference: e.target.value })}
              />
              <button type="button" onClick={() => removeSize(i)} className="px-2 text-xs text-[var(--admin-text-muted)] hover:text-[var(--admin-danger)]">
                Remove
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addSize} className="mt-3 rounded-md border border-[var(--admin-border-strong)] px-4 py-2 text-sm text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)]">
          + Add size
        </button>
      </div>
      {field("Closing text", <textarea className={textareaClass} value={content.closingBody} onChange={(e) => setContent((c) => ({ ...c, closingBody: e.target.value }))} />)}
      <SaveBar saving={saving} saved={saved} error={error} />
    </form>
  );
}
