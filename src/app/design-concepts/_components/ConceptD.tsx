import { EB_Garamond, Space_Mono } from "next/font/google";
import { ProductImage } from "@/components/ProductImage";
import { formatPrice } from "@/lib/format";
import { cardProducts, heroProduct, quoteProduct } from "../_lib/shared-content";
import { ConceptLabel } from "./ConceptLabel";
import { SpecimenLegend } from "./SpecimenLegend";

const garamond = EB_Garamond({ weight: ["400", "500"], style: ["normal", "italic"], subsets: ["latin"] });
const mono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"] });

const PAPER = "#f2ede2";
const NAVY = "#1c2230";
const SEAL = "#7a1f22";
const RULE = "#c9bfa8";

export function ConceptD() {
  return (
    <section className="scroll-mt-16" style={{ backgroundColor: PAPER, color: NAVY }}>
      <ConceptLabel
        id="concept-d"
        title="D — One of One (artisan's ledger)"
        rationale="Cream paper, navy ink, one wax-seal red. Every piece framed as a numbered, one-of-one ledger entry rather than a catalogue listing."
        titleStyle={{ fontFamily: garamond.style.fontFamily, fontStyle: "italic", fontSize: "1.6rem", color: NAVY }}
        mutedStyle={{ fontFamily: mono.style.fontFamily, fontSize: "0.75rem", color: SEAL }}
      />
      <div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-16 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <p className={mono.className} style={{ fontSize: "0.75rem", letterSpacing: "0.08em", color: SEAL }}>
              EST. — HANDCRAFTED IN SMALL BATCHES
            </p>
            <h3 className={garamond.className} style={{ fontStyle: "italic", fontSize: "2.75rem", lineHeight: 1.15, marginTop: "0.75rem" }}>
              No. 001 through one-of-one.
            </h3>
            <p className="mt-4 max-w-sm" style={{ color: `${NAVY}b3` }}>
              Every piece is entered once, cast once, and never repeated the
              same way twice.
            </p>
            <a
              href="#concept-d"
              className="mt-7 inline-block border px-7 py-3.5 text-sm transition hover:opacity-80"
              style={{ borderColor: NAVY, color: NAVY }}
            >
              Open the ledger
            </a>
          </div>
          <div className="border p-2" style={{ borderColor: RULE }}>
            <div className="aspect-[4/5] w-full grayscale-[55%] sepia-[30%] contrast-110">
              <ProductImage idExt={heroProduct.images[0]} alt={heroProduct.name} w={500} h={625} />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-6 pb-6">
          <div style={{ borderTop: `1px solid ${RULE}` }}>
            {cardProducts.map((p, i) => (
              <div
                key={p.slug}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-5"
                style={{ borderBottom: `1px solid ${RULE}` }}
              >
                <span className="h-16 w-16 shrink-0 overflow-hidden border grayscale-[55%] sepia-[30%] contrast-110" style={{ borderColor: RULE }}>
                  <ProductImage idExt={p.images[0]} alt={p.name} w={200} h={200} />
                </span>
                <div>
                  <p className={mono.className} style={{ fontSize: "0.7rem", color: SEAL }}>
                    No. {String(i + 1).padStart(3, "0")}
                  </p>
                  <p className={garamond.className} style={{ fontStyle: "italic", fontSize: "1.2rem" }}>
                    {p.name}
                  </p>
                  <p className={mono.className} style={{ fontSize: "0.7rem", color: `${NAVY}80`, marginTop: "0.15rem" }}>
                    {p.material.split(",")[0]}
                    {p.stone ? `, ${p.stone.split(",")[0].toLowerCase()}` : ""}
                  </p>
                </div>
                <p className={mono.className} style={{ fontSize: "0.85rem" }}>
                  {formatPrice(p)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-xl px-6 py-14">
          <p className={garamond.className} style={{ fontStyle: "italic", fontSize: "1.3rem", borderLeft: `2px solid ${SEAL}`, paddingLeft: "1.25rem" }}>
            “{quoteProduct.story}”
          </p>
        </div>

        <SpecimenLegend
          swatches={[
            { name: "Paper", hex: PAPER },
            { name: "Navy ink", hex: NAVY },
            { name: "Seal", hex: SEAL },
            { name: "Rule line", hex: RULE },
          ]}
          specimens={[
            { label: "EB Garamond italic — names", style: { fontFamily: garamond.style.fontFamily, fontStyle: "italic", fontSize: "1.5rem" } },
            { label: "Space Mono — ledger data", style: { fontFamily: mono.style.fontFamily, fontSize: "1rem" } },
          ]}
        />
      </div>
    </section>
  );
}
