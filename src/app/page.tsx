import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";
import { products } from "@/lib/products";
import { STOCK } from "@/lib/stockImages";

const FEATURED = ["vahavta-ring", "emerald-pendant", "anemone", "maslul"];

const CATEGORY_TILES = [
  { name: "Rings", href: "/shop?category=Rings", blurb: "Sculptural bands, sized to order.", image: products.find((p) => p.slug === "anemone")!.images[0] },
  { name: "Necklaces", href: "/shop?category=Necklaces", blurb: "Pendants and chains, everyday to certified stones.", image: products.find((p) => p.slug === "maslul")!.images[0] },
  { name: "Bracelets", href: "/shop?category=Bracelets", blurb: "One bangle, cast solid and set with spinel.", image: products.find((p) => p.slug === "tsil-bangle")!.images[0] },
];

const TESTIMONIALS = [
  {
    quote:
      "The ring arrived exactly as photographed, down to the brushed finish. It's the first piece of jewelry I've bought online that felt handmade, not manufactured.",
    detail: "Sample quote — replace with a real review",
  },
  {
    quote:
      "I sent three reference photos for a bespoke piece and heard back within a day. Three fittings later it fits like it was always mine.",
    detail: "Sample quote — replace with a real review",
  },
  {
    quote:
      "Heavier and better made than I expected from the photos. The pouch and box made it feel like an occasion, not just a delivery.",
    detail: "Sample quote — replace with a real review",
  },
];

const PROCESS = [
  "Hand-carved in wax",
  "Cast in sterling silver or gold",
  "Set stone by stone",
  "Finished on one bench",
];

const HERO_PRODUCT = "emerald-pendant";
const FINAL_MOMENT_PRODUCT = "cala";

export default function Home() {
  const featured = FEATURED.map((slug) => products.find((p) => p.slug === slug)!).filter(Boolean);
  const heroProduct = products.find((p) => p.slug === HERO_PRODUCT)!;
  const finalProduct = products.find((p) => p.slug === FINAL_MOMENT_PRODUCT)!;

  return (
    <>
      {/* Hero — split panel, not an overlay-on-image template */}
      <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,42%)_1fr]">
        <div className="order-2 flex flex-col justify-center px-4 py-16 sm:px-6 lg:order-1 lg:px-14 lg:py-0 xl:px-20">
          <h1 className="max-w-md font-display text-[2.6rem] leading-[1.08] sm:text-5xl lg:text-[3.2rem]">
            Jewelry shaped by material, meaning and instinct.
          </h1>
          <p className="mt-6 max-w-sm text-ink/70">
            Sculptural pieces handcrafted in limited quantities, designed to
            carry meaning beyond the object.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-6">
            <Link
              href="/shop"
              className="border border-ink px-7 py-3.5 text-sm text-ink transition hover:bg-ink hover:text-ivory"
            >
              Shop the collection
            </Link>
            <Link href="/story" className="text-sm text-ink/80 underline underline-offset-4 hover:text-ink">
              Discover AKH
            </Link>
          </div>
          <Link
            href={`/product/${heroProduct.slug}`}
            className="mt-14 block text-xs text-mineral underline underline-offset-4 hover:text-ink"
          >
            Pictured: {heroProduct.name}
          </Link>
        </div>
        <div className="relative order-1 aspect-[4/5] lg:order-2 lg:aspect-auto lg:h-[92vh]">
          <ProductImage idExt={heroProduct.images[0]} alt={heroProduct.name} w={1600} h={2000} />
        </div>
      </section>

      {/* Process ticker — one deliberate moving moment, not decoration everywhere */}
      <div className="overflow-hidden border-y border-ink/10 bg-ink py-3 text-ivory">
        <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-10 text-xs uppercase tracking-[0.18em]">
          {[...PROCESS, ...PROCESS, ...PROCESS].map((line, i) => (
            <span key={i} className="flex items-center gap-10 whitespace-nowrap text-ivory/70">
              {line}
              <span className="text-copper-soft">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Featured Collection */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl sm:text-4xl">Recent pieces</h2>
          <Link href="/shop" className="hidden text-sm text-ink/60 underline underline-offset-4 hover:text-ink sm:block">
            View all
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* Brand Story */}
      <section className="bg-charcoal text-ivory">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:px-8">
          <div className="aspect-[4/5] w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={STOCK.brandStoryProcess} alt="Hand-finishing a piece at the studio bench" className="h-full w-full object-cover" />
          </div>
          <div>
            <h2 className="font-display text-3xl leading-tight sm:text-4xl">
              One studio, one bench, every piece made by hand.
            </h2>
            <p className="mt-6 text-ivory/75">
              AKH is a one-studio jewelry practice working in sterling silver and gold,
              set with hand-selected stones — emeralds, sapphires, garnets, spinel,
              kunzite. Every piece is carved, cast, set and finished on the same
              bench, in small batches rather than continuous production runs.
            </p>
            <p className="mt-4 text-ivory/75">
              The starting point is never a trend. Kohl Davar Bezmano, one of the
              studio&apos;s rings, is named for a line of Hebrew that reminds its
              wearer everything comes in its own time. Levone is set with kunzite,
              a stone that fades in daylight — so it&apos;s made to be worn at
              night. The name comes before the design, not after it.
            </p>
            <Link href="/story" className="mt-7 inline-block text-sm text-ivory underline underline-offset-4 hover:text-copper-soft">
              Read the full story
            </Link>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl sm:text-4xl">Find your piece</h2>
        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {CATEGORY_TILES.map((cat) => (
            <Link key={cat.name} href={cat.href} className="group relative aspect-[3/4] overflow-hidden">
              <ProductImage idExt={cat.image} alt={cat.name} className="transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-ivory">
                <h3 className="font-display text-lg">{cat.name}</h3>
                <p className="mt-1 text-xs text-ivory/70">{cat.blurb}</p>
              </div>
            </Link>
          ))}
          <Link href="/bespoke" className="group relative aspect-[3/4] overflow-hidden bg-ink">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={STOCK.bespokeEditorial}
              alt="Bespoke jewelry making"
              className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-ivory">
              <h3 className="font-display text-lg">Bespoke</h3>
              <p className="mt-1 text-xs text-ivory/70">Commission a piece made only for you.</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Craftsmanship */}
      <section className="bg-ivory-deep">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="font-display text-3xl leading-tight sm:text-4xl">
              From wax to worn: how a piece gets made.
            </h2>
            <dl className="mt-8 divide-y divide-ink/10 border-t border-ink/10">
              {[
                ["Carve", "Every design starts as a hand-carved wax model, not a CAD file."],
                ["Cast", "Sterling silver or gold is cast from that wax original in small batches."],
                ["Set", "Hand-selected stones are set and checked individually under magnification."],
                ["Finish", "Each piece is polished, inspected and packed by hand at the same bench."],
              ].map(([step, copy]) => (
                <div key={step} className="flex gap-6 py-4">
                  <dt className="w-16 shrink-0 font-display text-lg text-ink">{step}</dt>
                  <dd className="text-sm text-ink/70">{copy}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-square overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={STOCK.craftsmanshipHands} alt="Artisan setting a stone by hand" className="h-full w-full object-cover" />
            </div>
            <div className="mt-10 aspect-square overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={STOCK.craftsmanshipTools} alt="Metalworking tools at the studio bench" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Bespoke Experience */}
      <section className="bg-charcoal text-ivory">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl sm:text-4xl">A piece made only for you</h2>
          <ol className="mt-12 grid grid-cols-1 gap-x-10 gap-y-10 border-t border-ivory/15 pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Share your idea", "Tell us the meaning, occasion or reference behind the piece."],
              ["Select materials", "Choose your metal and stone from our sourced selection, or bring your own."],
              ["Approve the design", "Review a hand-drawn concept and a 3D render before anything is made."],
              ["Your piece is handcrafted", "Carved, cast and finished on our bench, then shipped with its own story."],
            ].map(([title, copy], i) => (
              <li key={title} className="border-l border-ivory/20 pl-5">
                <span className="text-sm text-ivory/40">{i + 1}</span>
                <h3 className="mt-2 text-base">{title}</h3>
                <p className="mt-2 text-sm text-ivory/65">{copy}</p>
              </li>
            ))}
          </ol>
          <Link
            href="/bespoke"
            className="mt-12 inline-block border border-ivory px-8 py-4 text-sm text-ivory transition hover:bg-ivory hover:text-ink"
          >
            Begin a bespoke piece
          </Link>
        </div>
      </section>

      {/* Social Proof */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl sm:text-4xl">From the studio&apos;s customers</h2>
        <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.quote} className="border-t border-ink/15 pt-6">
              <blockquote className="font-display text-lg leading-snug text-ink">“{t.quote}”</blockquote>
              <figcaption className="mt-4 text-xs text-mineral">{t.detail}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Final Brand Moment */}
      <section className="relative flex min-h-[65vh] items-center overflow-hidden bg-ink text-ivory">
        <div className="absolute inset-0">
          <ProductImage idExt={finalProduct.images[0]} alt={finalProduct.name} w={1600} h={1400} className="opacity-80" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />
        <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="font-display text-3xl leading-tight sm:text-5xl">
            Made once. Worn for years.
          </h2>
          <p className="mt-5 text-ivory/70">
            Every AKH piece is made in a limited quantity, on one bench, by hand.
          </p>
          <Link
            href="/shop"
            className="mt-9 inline-block border border-ivory px-9 py-4 text-sm text-ivory transition hover:bg-ivory hover:text-ink"
          >
            Shop the collection
          </Link>
          <Link href={`/product/${finalProduct.slug}`} className="mt-4 block text-xs text-ivory/60 underline underline-offset-4 hover:text-ivory">
            Pictured: {finalProduct.name}
          </Link>
        </div>
      </section>
    </>
  );
}
