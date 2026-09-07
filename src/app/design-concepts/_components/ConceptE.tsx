import { ProductImage } from "@/components/ProductImage";
import { formatPrice } from "@/lib/format";
import { cardProducts, heroProduct, quoteProduct } from "../_lib/shared-content";
import { ConceptLabel } from "./ConceptLabel";
import { SpecimenLegend } from "./SpecimenLegend";

// Deliberately the one all-sans, no-serif-anywhere concept — modeled on the
// real Wwake research finding: hierarchy flattened almost flat (product
// names rendered at body size, not a big heading), the "accent color" is
// literally grey, no filled buttons anywhere. Confidence through restraint
// rather than more type/color.
const WHITE = "#faf9f6";
const INK = "#18181a";
const GREY = "#8c8a85";
const RULE = "#e7e4de";

// A gentle neutralizing filter (not a full grayscale) — pushes the photos'
// warm cream/tan backdrops toward neutral without flattening the metal and
// stone color entirely, so they sit quietly on a true-white ground instead
// of reading as a mismatched golden cast.
const NEUTRALIZE = "grayscale-[15%] brightness-105 contrast-105 saturate-90";

export function ConceptE() {
  return (
    <section className="scroll-mt-16" style={{ backgroundColor: WHITE, color: INK }}>
      <ConceptLabel
        id="concept-e"
        title="E — Gallery (white, restrained)"
        rationale="A true white-to-off-white ground, near-black ink, one accent: grey. No filled buttons, almost no type hierarchy — the object does the work, not the styling around it."
        titleStyle={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "1.1rem", color: INK }}
        mutedStyle={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: GREY }}
      />
      <div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p style={{ color: GREY, fontSize: "0.85rem" }}>Sculptural silver and gold, cast in small batches.</p>
            <h3 style={{ fontWeight: 500, fontSize: "1.6rem", marginTop: "0.75rem", lineHeight: 1.3 }}>
              One object. Considered closely.
            </h3>
            <a
              href="#concept-e"
              className="mt-8 inline-block border-b pb-1 text-sm transition hover:opacity-60"
              style={{ borderColor: INK }}
            >
              View the collection
            </a>
          </div>
          <div className="aspect-[4/5] overflow-hidden">
            <ProductImage idExt={heroProduct.images[0]} alt={heroProduct.name} w={1000} h={1250} className={NEUTRALIZE} />
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6 pb-16" style={{ borderTop: `1px solid ${RULE}` }}>
          <div className="grid grid-cols-1 gap-x-10 gap-y-12 pt-12 sm:grid-cols-3">
            {cardProducts.map((p) => (
              <div key={p.slug}>
                <div className="aspect-square overflow-hidden">
                  <ProductImage idExt={p.images[0]} alt={p.name} className={NEUTRALIZE} />
                </div>
                <div className="mt-4 flex items-baseline justify-between" style={{ fontSize: "0.9rem" }}>
                  <span>{p.name}</span>
                  <span style={{ color: GREY }}>{formatPrice(p)}</span>
                </div>
                <p style={{ fontSize: "0.8rem", color: GREY, marginTop: "0.15rem" }}>{p.material.split(",")[0]}</p>
              </div>
            ))}
          </div>
        </div>

        <blockquote className="mx-auto max-w-lg px-6 py-16 text-center" style={{ borderTop: `1px solid ${RULE}` }}>
          <p style={{ fontSize: "1.1rem", color: INK, lineHeight: 1.6 }}>“{quoteProduct.story}”</p>
        </blockquote>

        <SpecimenLegend
          swatches={[
            { name: "White", hex: WHITE },
            { name: "Ink", hex: INK },
            { name: "Grey (the only accent)", hex: GREY },
            { name: "Rule line", hex: RULE },
          ]}
          specimens={[
            { label: "Inter medium — everything", style: { fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "1.3rem" } },
            { label: "Inter regular — body", style: { fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: "1rem" } },
          ]}
        />
      </div>
    </section>
  );
}
