import type { Metadata } from "next";
import { SimplePage } from "@/components/SimplePage";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "AKH shipping timelines, international duties and return policy.",
};

export default function ShippingReturnsPage() {
  return (
    <SimplePage eyebrow="Policy" title="Shipping & Returns">
      <div>
        <h2 className="font-display text-lg text-ink">Shipping</h2>
        <p className="mt-2">
          In-stock pieces ship within 1–4 business days. Made-to-order and bespoke
          pieces are handcrafted after your order is placed and typically ship in
          3–4 weeks; each product page shows its exact estimate.
        </p>
      </div>
      <div>
        <h2 className="font-display text-lg text-ink">International orders</h2>
        <p className="mt-2">
          We ship worldwide. International orders may be subject to local customs
          duties and import taxes, charged by your country on delivery and not
          included in the checkout price.
        </p>
      </div>
      <div>
        <h2 className="font-display text-lg text-ink">Returns</h2>
        <p className="mt-2">
          In-stock pieces can be returned within 14 days of delivery in unworn,
          original condition for a full refund. Made-to-order and one-of-one pieces
          are final sale, since they are built around a specific size or stone.
        </p>
      </div>
    </SimplePage>
  );
}
