"use client";

import type { SimpleListContent } from "@/lib/pages";
import { field, inputClass, textareaClass, usePageSave, SaveBar } from "./shared";

export function SimpleListForm({ content: initial }: { content: SimpleListContent }) {
  const { content, setContent, save, saving, error, saved } = usePageSave("care", initial);

  function updateRule(i: number, value: string) {
    setContent((c) => ({ ...c, rules: c.rules.map((r, idx) => (idx === i ? value : r)) }));
  }
  function removeRule(i: number) {
    setContent((c) => ({ ...c, rules: c.rules.filter((_, idx) => idx !== i) }));
  }
  function addRule() {
    setContent((c) => ({ ...c, rules: [...c.rules, ""] }));
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
        <span className="block text-xs font-medium uppercase tracking-wide text-slate-500">Rules</span>
        <div className="mt-2 space-y-2">
          {content.rules.map((rule, i) => (
            <div key={i} className="flex gap-2">
              <input className={inputClass + " mt-0"} value={rule} onChange={(e) => updateRule(i, e.target.value)} />
              <button type="button" onClick={() => removeRule(i)} className="px-2 text-xs text-slate-500 hover:text-red-600">
                Remove
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addRule} className="mt-3 rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
          + Add rule
        </button>
      </div>
      <SaveBar saving={saving} saved={saved} error={error} />
    </form>
  );
}
