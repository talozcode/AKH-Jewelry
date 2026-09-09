import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";
import { getFeaturedProducts, getHeroProduct, getProducts } from "@/lib/products";
import { STOCK } from "@/lib/stockImages";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [selected, heroProduct, allProducts] = await Promise.all([
    getFeaturedProducts(4),
    getHeroProduct(),
    getProducts(),
  ]);
  // Owner-controlled via /admin (is_hero on a product); fall back to the
  // first published product so the homepage never has an empty hero if no
  // product is currently marked as hero.
  const hero = heroProduct ?? allProducts[0];
  if (!hero) return null;

  return (
    <>
      {/* Hero — a strong photographic moment, not a designed graphic composition */}
      <section className="relative flex min-h-[90vh] items-end overflow-hidden bg-charcoal text-ivory">
        <div className="absolute inset-0">
          <ProductImage idExt={hero.images[0]} alt={hero.name} w={1800} h={2250} className="opacity-90" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/35 to-transparent" />
        <div className="relative mx-auto w-full max-w-6xl px-6 pb-20 sm:px-8">
          <h1 className="font-display text-5xl italic leading-[1.05] sm:text-6xl lg:text-7xl">
            objects of light.
          </h1>
          <p className="mt-6 max-w-md text-base text-ivory/80 sm:text-lg">
            Jewelry shaped by transformation, time and the beauty of imperfection.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-6">
            <Link
              href="/shop"
              className="bg-ivory px-8 py-4 text-sm text-charcoal transition hover:bg-ivory/90"
            >
              Shop collection →
            </Link>
            <Link href="/story" className="text-sm text-ivory/80 underline underline-offset-4 hover:text-ivory">
              Our story
            </Link>
          </div>
        </div>
      </section>

      {/* Selected pieces — product discovery, quiet and quick */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:px-8">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl italic sm:text-4xl">Selected pieces</h2>
          <Link href="/shop" className="hidden text-sm text-ink/60 underline underline-offset-4 hover:text-ink sm:block">
            View all
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {selected.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* Editorial photography — let the image carry the moment */}
      <section className="relative flex h-[70vh] items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={STOCK.brandStoryProcess} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-charcoal/10" />
      </section>

      {/* Short AKH story */}
      <section className="mx-auto max-w-2xl px-6 py-20 text-center sm:px-8">
        <h2 className="font-display text-3xl italic sm:text-4xl">A studio, not a factory</h2>
        <p className="mt-6 text-ink/75">
          AKH is a one-studio jewelry practice working in sterling silver and
          gold, set with hand-selected stones. Every piece is carved, cast,
          set and finished on the same bench, in small batches rather than
          continuous production — quiet objects, made slowly, meant to be
          worn for years.
        </p>
        <Link href="/story" className="mt-6 inline-block text-sm text-ink underline underline-offset-4 hover:text-copper">
          Read the full story
        </Link>
      </section>

      {/* The meaning behind the name — quiet, deliberately small */}
      <section style={{ backgroundColor: "var(--color-ivory-deep)" }}>
        <div className="mx-auto max-w-xl px-6 py-16 text-center sm:px-8">
          <p className="text-xs uppercase tracking-[0.14em]" style={{ color: "var(--color-brass)" }}>
            The name
          </p>
          <p className="mt-4 font-display text-lg italic leading-relaxed text-ink/80">
            In Ancient Egypt, akh named the part of a person that becomes
            radiant and enduring — light, transformation, permanence. AKH
            borrows the feeling, not the imagery: pieces meant to last, worn
            until they carry their own history.
          </p>
        </div>
      </section>

      {/* Closing */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center sm:px-8">
        <Link
          href="/shop"
          className="inline-block bg-charcoal px-9 py-4 text-sm text-ivory transition hover:bg-charcoal-soft"
        >
          Shop the collection
        </Link>
      </section>
    </>
  );
}
