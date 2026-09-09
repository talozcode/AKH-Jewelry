"use client";

import type { StoryContent } from "@/lib/pages";
import type { MediaAsset } from "@/lib/media";
import { MediaPicker } from "../../_components/MediaPicker";
import { field, inputClass, textareaClass, usePageSave, SaveBar } from "./shared";

export function StoryForm({ content: initial, assets }: { content: StoryContent; assets: MediaAsset[] }) {
  const { content, setContent, save, saving, error, saved } = usePageSave("story", initial);
  const set = <K extends keyof StoryContent>(key: K, value: StoryContent[K]) => setContent((c) => ({ ...c, [key]: value }));

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
      {field(
        "Body",
        <textarea
          className={textareaClass + " min-h-56"}
          value={content.bodyProse}
          onChange={(e) => set("bodyProse", e.target.value)}
        />,
        "Separate paragraphs with a blank line."
      )}
      {field("Closing heading", <input className={inputClass} value={content.closingHeading} onChange={(e) => set("closingHeading", e.target.value)} />)}
      {field("Closing CTA label", <input className={inputClass} value={content.closingCtaLabel} onChange={(e) => set("closingCtaLabel", e.target.value)} />)}
      <SaveBar saving={saving} saved={saved} error={error} />
    </form>
  );
}
