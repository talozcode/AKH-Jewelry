import type { Metadata } from "next";
import { SimplePage } from "@/components/SimplePage";
import { RichText } from "@/components/RichText";
import { getPage } from "@/lib/pages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How AKH Jewelry collects, uses and protects your personal data, including your GDPR, CCPA and Israeli privacy rights.",
};

export default async function PrivacyPage() {
  const content = await getPage("privacy");

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
