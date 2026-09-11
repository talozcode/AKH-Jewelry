import type { Metadata } from "next";
import { SimplePage } from "@/components/SimplePage";
import { RichText } from "@/components/RichText";
import { getPage } from "@/lib/pages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Terms of Sale",
  description: "AKH Jewelry's terms of sale: orders, made-to-order and bespoke pieces, shipping, returns and warranty.",
};

export default async function TermsPage() {
  const content = await getPage("terms");

  return (
    <SimplePage title={content.heading} intro={content.intro}>
      {content.lastUpdated ? <p className="text-xs uppercase tracking-wide text-ink/50">Last updated {content.lastUpdated}</p> : null}
      {content.sections.map((section, i) => (
        <div key={i}>
          <h2 className="font-display text-lg text-ink">{section.heading}</h2>
          {section.body.split(/\n\n+/).map((paragraph, i) => (
            <p key={i} className="mt-2">
              <RichText text={paragraph} />
            </p>
          ))}
        </div>
      ))}
    </SimplePage>
  );
}
