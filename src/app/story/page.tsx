import type { Metadata } from "next";
import { PlaceholderArt } from "@/components/PlaceholderArt";

export const metadata: Metadata = {
  title: "Our Story",
  description: "The studio, the bench and the process behind AKH Jewelry.",
};

export default function StoryPage() {
  return (
    <>
      <section className="bg-charcoal text-ivory">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.16em] text-copper-soft">Our Story</p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
            One studio. One bench. Every piece made by hand.
          </h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="aspect-[4/5]">
          <PlaceholderArt motif="hands" tone="copper" label="Founder portrait" />
        </div>
        <div className="space-y-5 text-sm leading-relaxed text-ink/75">
          <p>
            AKH is a one-studio jewelry practice, founded to make pieces that mean
            something to the person wearing them, not just to the market they&apos;re
            sold into.
          </p>
          <p>
            Every design starts as a hand-carved wax model on the same bench where it
            will later be cast, set and finished. There is no design software between
            the idea and the object, and no factory between the studio and the
            customer.
          </p>
          <p>
            Materials are chosen deliberately: recycled sterling silver and 18k gold,
            and stones sourced directly, including Nigerian emeralds and white
            sapphires selected one at a time rather than bought by the parcel.
          </p>
          <p>
            What makes the process distinctive is its scale. Pieces are made in small,
            numbered batches, and one-of-one settings are built around a single stone
            and never repeated once it&apos;s gone.
          </p>
        </div>
      </section>

      <section className="bg-ivory-deep">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl">Have a question about a piece, or an idea for one?</h2>
          <a
            href="mailto:hello@akhjewelry.com"
            className="mt-6 inline-block bg-ink px-7 py-3.5 text-sm uppercase tracking-[0.12em] text-ivory hover:bg-copper"
          >
            hello@akhjewelry.com
          </a>
        </div>
      </section>
    </>
  );
}
