"use client";

import type { SimpleProseContent } from "@/lib/pages";
import { field, inputClass, textareaClass, usePageSave, SaveBar } from "./shared";

export function SimpleProseForm({ pageKey, content: initial }: { pageKey: "contact"; content: SimpleProseContent }) {
  const { content, setContent, save, saving, error, saved } = usePageSave(pageKey, initial);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="space-y-6"
    >
      {field("Heading", <input className={inputClass} value={content.heading} onChange={(e) => setContent((c) => ({ ...c, heading: e.target.value }))} />)}
      {field("Intro (optional)", <textarea className={textareaClass} value={content.intro ?? ""} onChange={(e) => setContent((c) => ({ ...c, intro: e.target.value }))} />)}
      {field(
        "Body",
        <textarea className={textareaClass + " min-h-40"} value={content.bodyProse} onChange={(e) => setContent((c) => ({ ...c, bodyProse: e.target.value }))} />,
        "Separate paragraphs with a blank line."
      )}
      <SaveBar saving={saving} saved={saved} error={error} />
    </form>
  );
}
