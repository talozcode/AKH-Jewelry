import type { Metadata } from "next";
import { Accordion } from "@/components/Accordion";
import { SimplePage } from "@/components/SimplePage";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about AKH pieces, sizing, shipping and care.",
};

export default function FaqPage() {
  return (
    <SimplePage eyebrow="Help" title="Frequently Asked Questions">
      <Accordion
        items={[
          { title: "Who makes AKH jewelry?", content: "Every piece is made by hand in a single studio, from a hand-carved wax model through casting, setting and finishing." },
          { title: "Are the materials genuine?", content: "Yes. We use recycled sterling silver and 18k recycled gold, set with genuine stones including Nigerian emeralds and white sapphires, hand-selected by the studio." },
          { title: "How do I find my ring size?", content: "See our size guide, or email hello@akhjewelry.com with a ring you already own that fits and we'll help you match it." },
          { title: "When will my order ship?", content: "In-stock pieces ship in 1–4 business days. Made-to-order and bespoke pieces take 3–4 weeks; the exact estimate is shown on each product page." },
          { title: "Can I return a piece?", content: "In-stock pieces can be returned within 14 days in unworn condition. Made-to-order and one-of-one pieces are final sale, as noted on the product page." },
          { title: "Is checkout secure?", content: "Yes — payments are processed securely at checkout. Online checkout is launching soon; in the meantime, email hello@akhjewelry.com to reserve a piece." },
          { title: "What if my piece needs repair?", content: "Email hello@akhjewelry.com with photos of the issue. Studio-made pieces are covered for manufacturing defects for 12 months." },
        ]}
      />
    </SimplePage>
  );
}
