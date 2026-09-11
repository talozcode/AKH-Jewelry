import { ProductCard } from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";
import { cardProducts, heroProduct, quoteProduct } from "../_lib/shared-content";
import { ConceptLabel } from "./ConceptLabel";
import { SpecimenLegend } from "./SpecimenLegend";

export function ConceptA() {
  return (
    <section className="scroll-mt-16 border-t-2 border-ink/10 bg-ivory">
      <ConceptLabel
        id="concept-a"
        title="A - Earth & Hand (refined baseline)"
        rationale="The current live direction, as-is: warm olive and brass, Fraunces headlines, a handwritten wordmark. The control - a clean reference for the other three to be measured against."
        titleStyle={{ fontFamily: "var(--font-fraunces)", fontSize: "1.5rem", color: "var(--color-ink)" }}
        mutedStyle={{ fontSize: "0.85rem", color: "var(--color-mineral)" }}
      />
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-14 lg:grid-cols-2">
        <div className="aspect-[4/5] overflow-hidden">
          <ProductImage idExt={heroProduct.images[0]} alt={heroProduct.name} w={900} h={1125} />
        </div>
        <div>
          <h3 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
            Cast by hand, worn for years.
          </h3>
          <p className="mt-4 max-w-sm text-ink/70">
            Sculptural silver and gold pieces, each shaped by material,
            meaning and instinct - in small batches, at the studio bench.
          </p>
          <a
            href="#concept-a"
            className="mt-7 inline-block border border-ink px-7 py-3.5 text-sm text-ink transition hover:bg-ink hover:text-ivory"
          >
            View the collection
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-3">
          {cardProducts.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </div>

      <blockquote className="mx-auto max-w-xl border-l-2 border-copper/50 px-6 py-14 text-lg italic text-ink/70">
        “{quoteProduct.story}”
      </blockquote>

      <SpecimenLegend
        swatches={[
          { name: "Ivory", hex: "#f6efe3" },
          { name: "Charcoal", hex: "#2c2a1d" },
          { name: "Copper", hex: "#767a4d" },
          { name: "Ink", hex: "#29230f" },
        ]}
        specimens={[
          { label: "Fraunces - display", style: { fontFamily: "var(--font-fraunces)", fontSize: "1.5rem" } },
          { label: "Inter - body", style: { fontFamily: "var(--font-inter)", fontSize: "1.1rem" } },
          { label: "Caveat - wordmark", style: { fontFamily: "var(--font-caveat)", fontSize: "1.6rem" } },
        ]}
      />
    </section>
  );
}
