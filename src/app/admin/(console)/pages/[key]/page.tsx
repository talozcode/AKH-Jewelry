import { notFound } from "next/navigation";
import { getPage, PAGE_LABELS, type PageKey } from "@/lib/pages";
import { listMediaAssets } from "@/lib/media";
import { HomeForm } from "../_forms/HomeForm";
import { StoryForm } from "../_forms/StoryForm";
import { BespokeForm } from "../_forms/BespokeForm";
import { FaqForm } from "../_forms/FaqForm";
import { SectionsForm } from "../_forms/SectionsForm";
import { SimpleListForm } from "../_forms/SimpleListForm";
import { SizeGuideForm } from "../_forms/SizeGuideForm";
import { SimpleProseForm } from "../_forms/SimpleProseForm";

export const dynamic = "force-dynamic";

const KEYS = Object.keys(PAGE_LABELS) as PageKey[];

export default async function EditPagePage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!KEYS.includes(key as PageKey)) notFound();
  const pageKey = key as PageKey;

  const assets = await listMediaAssets();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">{PAGE_LABELS[pageKey]}</h1>
      <div className="mt-8 max-w-2xl">
        {pageKey === "home" ? <HomeForm content={await getPage("home")} assets={assets} /> : null}
        {pageKey === "story" ? <StoryForm content={await getPage("story")} assets={assets} /> : null}
        {pageKey === "bespoke" ? <BespokeForm content={await getPage("bespoke")} assets={assets} /> : null}
        {pageKey === "faq" ? <FaqForm content={await getPage("faq")} /> : null}
        {pageKey === "shipping-returns" ? <SectionsForm pageKey="shipping-returns" content={await getPage("shipping-returns")} /> : null}
        {pageKey === "care" ? <SimpleListForm content={await getPage("care")} /> : null}
        {pageKey === "size-guide" ? <SizeGuideForm content={await getPage("size-guide")} /> : null}
        {pageKey === "contact" ? <SimpleProseForm pageKey="contact" content={await getPage("contact")} /> : null}
        {pageKey === "terms" ? <SectionsForm pageKey="terms" content={await getPage("terms")} /> : null}
        {pageKey === "privacy" ? <SectionsForm pageKey="privacy" content={await getPage("privacy")} /> : null}
      </div>
    </div>
  );
}
