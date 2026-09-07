import type { Metadata } from "next";
import { SimplePage } from "@/components/SimplePage";

export const metadata: Metadata = {
  title: "Size Guide",
  description: "Find your ring size for AKH pieces.",
};

const SIZES = [
  { us: "5", circumference: "49.3mm" },
  { us: "6", circumference: "51.9mm" },
  { us: "7", circumference: "54.4mm" },
  { us: "8", circumference: "56.9mm" },
  { us: "9", circumference: "59.5mm" },
  { us: "10", circumference: "62.1mm" },
];

export default function SizeGuidePage() {
  return (
    <SimplePage
      eyebrow="Sizing"
      title="Ring size guide"
      intro="Wrap a strip of paper around your finger, mark where it overlaps, and measure the length in millimeters against the chart below. If you're between sizes, we recommend sizing up."
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-ink/15 text-ink/50">
              <th className="py-2 pr-4 font-normal">US Size</th>
              <th className="py-2 font-normal">Finger Circumference</th>
            </tr>
          </thead>
          <tbody>
            {SIZES.map((s) => (
              <tr key={s.us} className="border-b border-ink/5">
                <td className="py-2 pr-4">{s.us}</td>
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
