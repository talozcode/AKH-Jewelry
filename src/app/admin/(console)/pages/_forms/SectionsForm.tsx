"use client";

import type { PageKey, SectionsContent } from "@/lib/pages";
import { field, inputClass, textareaClass, usePageSave, SaveBar } from "./shared";

export function SectionsForm({
  pageKey,
  content: initial,
}: {
  pageKey: Extract<PageKey, "shipping-returns" | "terms" | "privacy">;
  content: SectionsContent;
}) {
  const { content, setContent, save, saving, error, saved } = usePageSave(pageKey, initial);

  function updateSection(i: number, patch: Partial<SectionsContent["sections"][number]>) {
    setContent((c) => ({ ...c, sections: c.sections.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) }));
  }
  function removeSection(i: number) {
    setContent((c) => ({ ...c, sections: c.sections.filter((_, idx) => idx !== i) }));
  }
  function addSection() {
    setContent((c) => ({ ...c, sections: [...c.sections, { heading: "", body: "" }] }));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="space-y-6"
    >
      {field("Page heading", <input className={inputClass} value={content.heading} onChange={(e) => setContent((c) => ({ ...c, heading: e.target.value }))} />)}
      {field(
        "Intro (optional)",
        <textarea className={textareaClass} value={content.intro ?? ""} onChange={(e) => setContent((c) => ({ ...c, intro: e.target.value }))} />
      )}
      {field(
        "Last updated (optional)",
        <input
          className={inputClass}
          placeholder="2026-09-11"
          value={content.lastUpdated ?? ""}
          onChange={(e) => setContent((c) => ({ ...c, lastUpdated: e.target.value }))}
        />,
        "Shown at the top of the page. Update this when the content changes."
      )}
      <div className="space-y-4">
        {content.sections.map((section, i) => (
          <div key={i} className="rounded-md border border-[var(--admin-border)] p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--admin-text-faint)]">Section {i + 1}</span>
              <button type="button" onClick={() => removeSection(i)} className="text-xs text-[var(--admin-text-muted)] hover:text-[var(--admin-danger)]">
                Remove
              </button>
            </div>
            <input
              className={inputClass}
              placeholder="Heading"
              value={section.heading}
              onChange={(e) => updateSection(i, { heading: e.target.value })}
            />
            <textarea
              className={textareaClass + " min-h-32"}
              placeholder="Body"
              value={section.body}
              onChange={(e) => updateSection(i, { body: e.target.value })}
            />
            <span className="mt-1 block text-xs text-[var(--admin-text-faint)]">
              Separate paragraphs with a blank line. Add a link with [link text](https://example.com).
            </span>
          </div>
        ))}
      </div>
      <button type="button" onClick={addSection} className="rounded-md border border-[var(--admin-border-strong)] px-4 py-2 text-sm text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)]">
        + Add section
      </button>
      <SaveBar saving={saving} saved={saved} error={error} />
    </form>
  );
}
