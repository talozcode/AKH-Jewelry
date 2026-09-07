import { Karla } from "next/font/google";
import { ProductImage } from "@/components/ProductImage";
import { STOCK } from "@/lib/stockImages";
import { cardProducts, heroProduct, quoteProduct } from "../_lib/shared-content";
import { ConceptLabel } from "./ConceptLabel";
import { SpecimenLegend } from "./SpecimenLegend";

const karla = Karla({ weight: ["400", "500", "700"], subsets: ["latin"] });

const SAND = "#e8d9c3";
const TERRACOTTA = "#b5502f";
const UMBER = "#4a3626";
const SAGE = "#8a9873";
const CLAY = "#c98a5e";

// The existing Fraunces variable font, pushed toward its softer/rounder
// variation axes instead of loading a second display font.
const roundedFraunces = { fontFamily: "var(--font-fraunces)", fontVariationSettings: '"SOFT" 60, "opsz" 9, "WONK" 0' };

export function ConceptC() {
  return (
    <section
      className={`${karla.className} relative scroll-mt-16 overflow-hidden`}
      style={{ backgroundColor: SAND, color: UMBER }}
    >
      <ConceptLabel
        id="concept-c"
        title="C — Rooted (connected to the earth)"
        rationale="Terracotta and sage, circular crops, imperfect alignment — the tactile, earth-connected reading of handmade, pulling on the studio's own craftsmanship photography."
        titleStyle={{ ...roundedFraunces, fontSize: "1.5rem", color: UMBER }}
        mutedStyle={{ fontSize: "0.9rem", color: `${UMBER}99` }}
      />
      <div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-16 lg:grid-cols-2">
          <div className="relative">
            <h3 style={{ ...roundedFraunces, fontSize: "2.75rem", lineHeight: 1.1 }}>
              Shaped by hand, close to the earth.
            </h3>
            <p className="mt-5 max-w-sm" style={{ color: `${UMBER}b3` }}>
              Warm metal and raw stone, worked at the bench until the piece
              feels like it grew there.
            </p>
            <a
              href="#concept-c"
              className="mt-7 inline-block border px-7 py-3.5 text-sm transition hover:opacity-80"
              style={{ borderColor: UMBER, color: UMBER }}
            >
              Browse the collection
            </a>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-sm -rotate-2 overflow-hidden rounded-full border-8" style={{ borderColor: CLAY }}>
            <ProductImage idExt={heroProduct.images[0]} alt={heroProduct.name} w={1000} h={1000} />
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6 pb-6">
          <div className="grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-3">
            {cardProducts.map((p, i) => (
              <div key={p.slug} className={i % 2 === 0 ? "rotate-1" : "-rotate-1"}>
                <div className="mx-auto aspect-square w-4/5 overflow-hidden rounded-full border-4" style={{ borderColor: SAGE }}>
                  <ProductImage idExt={p.images[0]} alt={p.name} w={700} h={700} />
                </div>
                <p className="mt-4 text-center text-base" style={{ ...roundedFraunces }}>
                  {p.name}
                </p>
                <p className="text-center text-sm" style={{ color: `${UMBER}99` }}>
                  {p.material.split(",")[0]}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto max-w-2xl px-6 py-16 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={STOCK.craftsmanshipHands} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-10" />
          <p style={{ ...roundedFraunces, fontSize: "1.3rem", fontStyle: "italic", color: TERRACOTTA }}>
            “{quoteProduct.story}”
          </p>
        </div>

        <SpecimenLegend
          swatches={[
            { name: "Sand", hex: SAND },
            { name: "Terracotta", hex: TERRACOTTA },
            { name: "Clay", hex: CLAY },
            { name: "Sage", hex: SAGE },
            { name: "Umber", hex: UMBER },
          ]}
          specimens={[
            { label: "Fraunces (soft axis) — display", style: { ...roundedFraunces, fontSize: "1.5rem" } },
            { label: "Karla — body", style: { fontFamily: karla.style.fontFamily, fontSize: "1.1rem" } },
          ]}
        />
      </div>
    </section>
  );
}
