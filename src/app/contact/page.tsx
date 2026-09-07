import type { Metadata } from "next";
import { SimplePage } from "@/components/SimplePage";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the AKH studio.",
};

export default function ContactPage() {
  return (
    <SimplePage
      eyebrow="Contact"
      title="Get in touch"
      intro="For orders, bespoke enquiries, press or repairs, email the studio directly — we read and reply to every message ourselves."
    >
      <p>
        <a href="mailto:hello@akhjewelry.com" className="text-copper underline underline-offset-2">
          hello@akhjewelry.com
        </a>
      </p>
      <p>Studio based in Israel. Bespoke consultations available by video call on request.</p>
      <p>
        Follow along at{" "}
        <a href="https://www.instagram.com/akhjewelry" target="_blank" rel="noreferrer" className="text-copper underline underline-offset-2">
          @akhjewelry
        </a>{" "}
        and{" "}
        <a href="https://www.tiktok.com/@akh.jewelry" target="_blank" rel="noreferrer" className="text-copper underline underline-offset-2">
          @akh.jewelry
        </a>
        .
      </p>
    </SimplePage>
  );
}
