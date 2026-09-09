import type { Metadata } from "next";
import { SimplePage } from "@/components/SimplePage";
import { getPage } from "@/lib/pages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Size Guide",
  description: "Find your ring size for AKH pieces.",
};

export default async function SizeGuidePage() {
  const content = await getPage("size-guide");

  return (
    <SimplePage title={content.heading} intro={content.intro}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-ink/15 text-ink/50">
              <th className="py-2 pr-4 font-normal">EU Size</th>
              <th className="py-2 font-normal">Finger Circumference</th>
            </tr>
          </thead>
          <tbody>
            {content.sizes.map((s) => (
              <tr key={s.eu} className="border-b border-ink/5">
                <td className="py-2 pr-4">{s.eu}</td>
                <td className="py-2">{s.circumference}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>{content.closingBody}</p>
    </SimplePage>
  );
}
