import type { Metadata } from "next";
import { SimplePage } from "@/components/SimplePage";
import { getPage } from "@/lib/pages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Terms & Privacy",
  description: "AKH Jewelry terms of service and privacy policy.",
};

export default async function TermsPage() {
  const content = await getPage("terms");
  const paragraphs = content.bodyProse.split(/\n\n+/);

  return (
    <SimplePage title={content.heading}>
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </SimplePage>
  );
}
