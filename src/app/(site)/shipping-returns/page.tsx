import type { Metadata } from "next";
import { SimplePage } from "@/components/SimplePage";
import { getPage } from "@/lib/pages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "AKH shipping timelines, international duties and return policy.",
};

export default async function ShippingReturnsPage() {
  const content = await getPage("shipping-returns");

  return (
    <SimplePage title={content.heading}>
      {content.sections.map((section) => (
        <div key={section.heading}>
          <h2 className="font-display text-lg text-ink">{section.heading}</h2>
          <p className="mt-2">{section.body}</p>
        </div>
      ))}
    </SimplePage>
  );
}
