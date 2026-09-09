import type { Metadata } from "next";
import { SimplePage } from "@/components/SimplePage";
import { getPage } from "@/lib/pages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Jewelry Care",
  description: "How to care for your AKH silver, gold and stone pieces.",
};

export default async function CarePage() {
  const content = await getPage("care");

  return (
    <SimplePage title={content.heading}>
      <p>{content.intro}</p>
      <ul className="list-disc space-y-2 pl-5">
        {content.rules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
    </SimplePage>
  );
}
