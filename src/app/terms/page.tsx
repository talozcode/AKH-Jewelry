import type { Metadata } from "next";
import { SimplePage } from "@/components/SimplePage";

export const metadata: Metadata = {
  title: "Terms & Privacy",
  description: "AKH Jewelry terms of service and privacy policy.",
};

export default function TermsPage() {
  return (
    <SimplePage eyebrow="Legal" title="Terms & Privacy">
      <p>
        This page will host AKH&apos;s full terms of service and privacy policy ahead
        of launch, covering order terms, made-to-order and one-of-one sale
        conditions, and how customer data is collected and used.
      </p>
      <p>Questions in the meantime can be sent to hello@akhjewelry.com.</p>
    </SimplePage>
  );
}
