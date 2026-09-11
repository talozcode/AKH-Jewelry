"use client";

import type { FaqContent } from "@/lib/pages";
import { inputClass, textareaClass, usePageSave, SaveBar } from "./shared";

export function FaqForm({ content: initial }: { content: FaqContent }) {
  const { content, setContent, save, saving, error, saved } = usePageSave("faq", initial);

  function updateItem(i: number, patch: Partial<FaqContent["items"][number]>) {
    setContent((c) => ({ ...c, items: c.items.map((item, idx) => (idx === i ? { ...item, ...patch } : item)) }));
  }
  function removeItem(i: number) {
    setContent((c) => ({ ...c, items: c.items.filter((_, idx) => idx !== i) }));
  }
  function addItem() {
    setContent((c) => ({ ...c, items: [...c.items, { question: "", answer: "" }] }));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="space-y-4"
    >
      {content.items.map((item, i) => (
        <div key={i} className="rounded-md border border-[var(--admin-border)] p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--admin-text-faint)]">Question {i + 1}</span>
            <button type="button" onClick={() => removeItem(i)} className="px-2 py-2 text-xs text-[var(--admin-text-muted)] hover:text-[var(--admin-danger)]">
              Remove
            </button>
          </div>
          <input
            className={inputClass}
            placeholder="Question"
            value={item.question}
            onChange={(e) => updateItem(i, { question: e.target.value })}
          />
          <textarea
            className={textareaClass}
            placeholder="Answer"
            value={item.answer}
            onChange={(e) => updateItem(i, { answer: e.target.value })}
          />
        </div>
      ))}
      <button type="button" onClick={addItem} className="rounded-md border border-[var(--admin-border-strong)] px-4 py-2 text-sm text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)]">
        + Add question
      </button>
      <SaveBar saving={saving} saved={saved} error={error} />
    </form>
  );
}
