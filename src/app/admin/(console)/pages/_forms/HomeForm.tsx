"use client";

import type { HomeContent } from "@/lib/pages";
import type { MediaAsset } from "@/lib/media";
import { MediaPicker } from "../../_components/MediaPicker";
import { field, inputClass, textareaClass, usePageSave, SaveBar } from "./shared";

export function HomeForm({ content: initial, assets }: { content: HomeContent; assets: MediaAsset[] }) {
  const { content, setContent, save, saving, error, saved } = usePageSave("home", initial);
  const set = <K extends keyof HomeContent>(key: K, value: HomeContent[K]) => setContent((c) => ({ ...c, [key]: value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="space-y-6"
    >
      {field("Hero headline", <input className={inputClass} value={content.heroHeadline} onChange={(e) => set("heroHeadline", e.target.value)} />)}
      {field("Hero subhead", <textarea className={textareaClass} value={content.heroSubhead} onChange={(e) => set("heroSubhead", e.target.value)} />)}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {field(
          "Hero primary CTA label",
          <input className={inputClass} value={content.heroCtaPrimaryLabel} onChange={(e) => set("heroCtaPrimaryLabel", e.target.value)} />
        )}
        {field(
          "Hero secondary CTA label",
          <input className={inputClass} value={content.heroCtaSecondaryLabel} onChange={(e) => set("heroCtaSecondaryLabel", e.target.value)} />
        )}
      </div>
      {field(
        '"Selected pieces" heading',
        <input className={inputClass} value={content.sectionHeadingSelectedPieces} onChange={(e) => set("sectionHeadingSelectedPieces", e.target.value)} />
      )}
      <MediaPicker label="Editorial photo" value={content.editorialImageUrl} onChange={(url) => set("editorialImageUrl", url)} assets={assets} />
      {field("Editorial photo alt text", <input className={inputClass} value={content.editorialImageAlt} onChange={(e) => set("editorialImageAlt", e.target.value)} />)}
      {field("Studio story heading", <input className={inputClass} value={content.studioStoryHeading} onChange={(e) => set("studioStoryHeading", e.target.value)} />)}
      {field("Studio story text", <textarea className={textareaClass} value={content.studioStoryBody} onChange={(e) => set("studioStoryBody", e.target.value)} />)}
      {field("Studio story link label", <input className={inputClass} value={content.studioStoryCtaLabel} onChange={(e) => set("studioStoryCtaLabel", e.target.value)} />)}
      {field('"The name" eyebrow label', <input className={inputClass} value={content.nameMeaningEyebrow} onChange={(e) => set("nameMeaningEyebrow", e.target.value)} />)}
      {field("Name meaning text", <textarea className={textareaClass} value={content.nameMeaningBody} onChange={(e) => set("nameMeaningBody", e.target.value)} />)}
      {field("Closing CTA label", <input className={inputClass} value={content.closingCtaLabel} onChange={(e) => set("closingCtaLabel", e.target.value)} />)}
      <SaveBar saving={saving} saved={saved} error={error} />
    </form>
  );
}
