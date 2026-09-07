import type { Metadata } from "next";
import { SimplePage } from "@/components/SimplePage";

export const metadata: Metadata = {
  title: "Size Guide",
  description: "Find your ring size for AKH pieces.",
};

const SIZES = [
  { eu: "48", circumference: "48mm" },
  { eu: "51", circumference: "51mm" },
  { eu: "54", circumference: "54mm" },
  { eu: "56", circumference: "56mm" },
  { eu: "60", circumference: "60mm" },
];

export default function SizeGuidePage() {
  return (
    <SimplePage
      title="Ring size guide"
      intro="AKH rings are sized to EU standard: the size number is your finger's circumference in millimeters. Wrap a strip of paper around your finger, mark where it overlaps, and measure the length against the chart below. Most rings are cast to one size; email hello@akhjewelry.com before ordering if you need a different one."
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-ink/15 text-ink/50">
              <th className="py-2 pr-4 font-normal">EU Size</th>
              <th className="py-2 font-normal">Finger Circumference</th>
            </tr>
          </thead>
          <tbody>
            {SIZES.map((s) => (
              <tr key={s.eu} className="border-b border-ink/5">
                <td className="py-2 pr-4">{s.eu}</td>
                <td className="py-2">{s.circumference}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>Still unsure? Email hello@akhjewelry.com with a ring you own that fits and we&apos;ll help you match it.</p>
    </SimplePage>
  );
}
