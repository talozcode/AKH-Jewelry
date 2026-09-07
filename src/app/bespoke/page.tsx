import type { Metadata } from "next";
import { STOCK } from "@/lib/stockImages";

export const metadata: Metadata = {
  title: "Bespoke",
  description: "Commission a one-of-one piece from the AKH studio.",
};

const STEPS = [
  ["01", "Share your idea", "Email hello@akhjewelry.com with the meaning, occasion or reference behind the piece."],
  ["02", "Select materials and stones", "Choose metal and stone from our sourced selection, or bring your own stone to be set."],
  ["03", "Approve the design", "Review a hand-drawn concept and a 3D render before any metal is cast."],
  ["04", "Your piece is handcrafted", "Carved, cast, set and finished on our bench, then shipped with its own care card."],
];

export default function BespokePage() {
  return (
    <>
      <section className="relative flex min-h-[50vh] items-end overflow-hidden bg-charcoal text-ivory">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={STOCK.bespokeEditorial} alt="" className="h-full w-full object-cover opacity-70" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-charcoal/20" />
        <div className="relative mx-auto w-full max-w-5xl px-4 pb-14 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.16em] text-copper-soft">Bespoke</p>
          <h1 className="mt-3 max-w-xl font-display text-4xl leading-tight sm:text-5xl">
            A piece made only for you.
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([n, title, copy]) => (
            <div key={n}>
              <span className="font-display text-3xl text-copper">{n}</span>
              <h2 className="mt-3 text-base">{title}</h2>
              <p className="mt-2 text-sm text-ink/70">{copy}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-ink/10 pt-10 text-center">
          <h2 className="font-display text-2xl">Ready to begin?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-ink/70">
            Bespoke commissions typically take 3–5 weeks from approved design to
            delivery, depending on stone availability.
          </p>
          <a
            href="mailto:hello@akhjewelry.com?subject=Bespoke Enquiry"
            className="mt-6 inline-block bg-ink px-8 py-4 text-sm uppercase tracking-[0.14em] text-ivory hover:bg-copper"
          >
            Begin a Bespoke Piece
          </a>
        </div>
      </section>
    </>
  );
}
