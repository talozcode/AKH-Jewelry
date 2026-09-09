"use client";

import type { BespokeContent } from "@/lib/pages";
import type { MediaAsset } from "@/lib/media";
import { MediaPicker } from "../../_components/MediaPicker";
import { field, inputClass, textareaClass, usePageSave, SaveBar } from "./shared";

export function BespokeForm({ content: initial, assets }: { content: BespokeContent; assets: MediaAsset[] }) {
  const { content, setContent, save, saving, error, saved } = usePageSave("bespoke", initial);
  const set = <K extends keyof BespokeContent>(key: K, value: BespokeContent[K]) => setContent((c) => ({ ...c, [key]: value }));

  function updateStep(i: number, patch: Partial<BespokeContent["steps"][number]>) {
    set(
      "steps",
      content.steps.map((s, idx) => (idx === i ? { ...s, ...patch } : s))
    );
  }
  function removeStep(i: number) {
    set("steps", content.steps.filter((_, idx) => idx !== i));
  }
  function addStep() {
    set("steps", [...content.steps, { title: "", body: "" }]);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="space-y-6"
    >
      {field("Hero headline", <input className={inputClass} value={content.heroHeadline} onChange={(e) => set("heroHeadline", e.target.value)} />)}
      <MediaPicker label="Hero photo" value={content.heroImageUrl} onChange={(url) => set("heroImageUrl", url)} assets={assets} />
      {field("Hero photo alt text", <input className={inputClass} value={content.heroImageAlt} onChange={(e) => set("heroImageAlt", e.target.value)} />)}

      <div>
        <span className="block text-xs uppercase tracking-[0.08em] text-ink/50">Steps</span>
        <div className="mt-2 space-y-4">
          {content.steps.map((step, i) => (
            <div key={i} className="border border-ink/15 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink/40">Step {i + 1}</span>
                <button type="button" onClick={() => removeStep(i)} className="text-xs text-ink/50 hover:text-red-700">
                  Remove
                </button>
              </div>
              <input
                className={inputClass}
                placeholder="Title"
                value={step.title}
                onChange={(e) => updateStep(i, { title: e.target.value })}
              />
              <textarea
                className={textareaClass}
                placeholder="Body"
                value={step.body}
                onChange={(e) => updateStep(i, { body: e.target.value })}
              />
            </div>
          ))}
        </div>
        <button type="button" onClick={addStep} className="mt-3 border border-ink/20 px-4 py-2 text-sm hover:border-ink">
          + Add step
        </button>
      </div>

      {field("Closing heading", <input className={inputClass} value={content.closingHeading} onChange={(e) => set("closingHeading", e.target.value)} />)}
      {field("Closing body", <textarea className={textareaClass} value={content.closingBody} onChange={(e) => set("closingBody", e.target.value)} />)}
      {field("Closing CTA label", <input className={inputClass} value={content.closingCtaLabel} onChange={(e) => set("closingCtaLabel", e.target.value)} />)}
      <SaveBar saving={saving} saved={saved} error={error} />
    </form>
  );
}
