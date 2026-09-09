"use client";

import type { SectionsContent } from "@/lib/pages";
import { field, inputClass, textareaClass, usePageSave, SaveBar } from "./shared";

export function SectionsForm({ content: initial }: { content: SectionsContent }) {
  const { content, setContent, save, saving, error, saved } = usePageSave("shipping-returns", initial);

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
      <div className="space-y-4">
        {content.sections.map((section, i) => (
          <div key={i} className="rounded-md border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Section {i + 1}</span>
              <button type="button" onClick={() => removeSection(i)} className="text-xs text-slate-500 hover:text-red-600">
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
              className={textareaClass}
              placeholder="Body"
              value={section.body}
              onChange={(e) => updateSection(i, { body: e.target.value })}
            />
          </div>
        ))}
      </div>
      <button type="button" onClick={addSection} className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
        + Add section
      </button>
      <SaveBar saving={saving} saved={saved} error={error} />
    </form>
  );
}
