import type { Metadata } from "next";
import { Accordion } from "@/components/Accordion";
import { SimplePage } from "@/components/SimplePage";
import { getPage } from "@/lib/pages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about AKH pieces, sizing, shipping and care.",
};

export default async function FaqPage() {
  const content = await getPage("faq");

  return (
    <SimplePage title="Frequently Asked Questions">
      <Accordion items={content.items.map((item) => ({ title: item.question, content: item.answer }))} />
    </SimplePage>
  );
}
