import type { Metadata } from "next";
import { SimplePage } from "@/components/SimplePage";

export const metadata: Metadata = {
  title: "Jewelry Care",
  description: "How to care for your AKH silver, gold and stone pieces.",
};

export default function CarePage() {
  return (
    <SimplePage title="Caring for your piece">
      <p>Each product page includes care notes specific to that piece&apos;s metal and stone. A few general rules:</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Remove jewelry before swimming, showering, exercise or manual work.</li>
        <li>Apply perfume and lotion before putting jewelry on, not after.</li>
        <li>Polish silver with a soft jewelry cloth; avoid abrasive cleaners.</li>
        <li>Store pieces separately to prevent scratching, ideally in the pouch they arrived in.</li>
        <li>Softer stones (emerald, opal) should never go in an ultrasonic cleaner.</li>
      </ul>
    </SimplePage>
  );
}
