import type { Metadata } from "next";
import { ConceptNav } from "./_components/ConceptNav";
import { ConceptA } from "./_components/ConceptA";
import { ConceptB } from "./_components/ConceptB";
import { ConceptC } from "./_components/ConceptC";
import { ConceptD } from "./_components/ConceptD";
import { ConceptE } from "./_components/ConceptE";

export const metadata: Metadata = {
  title: "Design Concepts (Internal Review)",
  description: "Internal comparison of five visual design directions for AKH — not part of the live site.",
  robots: { index: false, follow: false },
};

export default function DesignConceptsPage() {
  return (
    <div className="bg-ivory">
      <ConceptNav />
      <div className="mx-auto max-w-2xl px-6 pt-12 text-center">
        <p className="text-xs text-mineral">Internal review — not linked from the live site</p>
        <h1 className="mt-2 font-display text-3xl text-ink">Five directions for AKH</h1>
        <p className="mt-3 text-sm text-ink/70">
          Same three real pieces, the same real story, five different design
          languages. Scroll through, or jump to one below.
        </p>
      </div>
      <ConceptA />
      <ConceptB />
      <ConceptC />
      <ConceptD />
      <ConceptE />
    </div>
  );
}
