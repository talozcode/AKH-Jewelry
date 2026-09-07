import { Italiana, Cormorant_Garamond } from "next/font/google";
import { ProductImage } from "@/components/ProductImage";
import { cardProducts, heroProduct, quoteProduct } from "../_lib/shared-content";
import { ConceptLabel } from "./ConceptLabel";
import { SpecimenLegend } from "./SpecimenLegend";

const italiana = Italiana({ weight: "400", subsets: ["latin"] });
const cormorant = Cormorant_Garamond({
  weight: ["400", "500"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const SOOT = "#17140f";
const BONE = "#efe9dd";
const RUST = "#7a3324";

export function ConceptB() {
  return (
    <section className="scroll-mt-16" style={{ backgroundColor: SOOT, color: BONE }}>
      <ConceptLabel
        id="concept-b"
        title="B — Talisman (ritual object)"
        rationale="A dark, reverent register — soot and bone, one object lit like a museum vitrine. 'Talisman' through presentation and materiality, not borrowed symbols."
        titleStyle={{ fontFamily: italiana.style.fontFamily, fontSize: "1.5rem", color: BONE }}
        mutedStyle={{ fontFamily: cormorant.style.fontFamily, fontSize: "0.9rem", color: `${BONE}99` }}
      />
      <div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-16 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <h3 className={italiana.className} style={{ fontSize: "2.75rem", lineHeight: 1.1 }}>
              Objects worth carrying.
            </h3>
            <p className={cormorant.className} style={{ fontStyle: "italic", fontSize: "1.15rem", marginTop: "1.25rem", color: `${BONE}b3`, maxWidth: "26rem" }}>
              Each piece is cast once, numbered once, and named for what it&apos;s
              meant to protect.
            </p>
            <a
              href="#concept-b"
              className="mt-8 inline-block border px-7 py-3.5 text-sm transition hover:opacity-80"
              style={{ borderColor: BONE, color: BONE }}
            >
              Enter the collection
            </a>
          </div>
          <div className="aspect-[4/5] border p-2" style={{ borderColor: `${BONE}40` }}>
            <div className="h-full w-full overflow-hidden">
              <ProductImage idExt={heroProduct.images[0]} alt={heroProduct.name} w={800} h={1400} />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {cardProducts.map((p, i) => (
              <div key={p.slug}>
                <div className="aspect-square border p-1.5" style={{ borderColor: `${BONE}30` }}>
                  <div className="h-full w-full overflow-hidden">
                    <ProductImage idExt={p.images[0]} alt={p.name} />
                  </div>
                </div>
                <p className={cormorant.className} style={{ fontStyle: "italic", marginTop: "0.9rem", fontSize: "1rem", color: `${BONE}cc` }}>
                  Plate {["I", "II", "III"][i]} — {p.name}, {p.material.split(",")[0].toLowerCase()}
                  {p.stone ? `, ${p.stone.split(",")[0].toLowerCase()}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>

        <blockquote className="mx-auto max-w-xl border-l-2 px-6 py-14" style={{ borderColor: RUST }}>
          <p className={cormorant.className} style={{ fontStyle: "italic", fontSize: "1.4rem", color: BONE }}>
            “{quoteProduct.story}”
          </p>
        </blockquote>

        <SpecimenLegend
          swatches={[
            { name: "Soot", hex: SOOT },
            { name: "Bone", hex: BONE },
            { name: "Rust", hex: RUST },
            { name: "Verdigris", hex: "#4f6357" },
          ]}
          specimens={[
            { label: "Italiana — display", style: { fontFamily: italiana.style.fontFamily, fontSize: "1.5rem" } },
            { label: "Cormorant Garamond — captions", style: { fontFamily: cormorant.style.fontFamily, fontStyle: "italic", fontSize: "1.25rem" } },
          ]}
        />
      </div>
    </section>
  );
}
