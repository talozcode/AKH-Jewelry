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
    name: "Sample quote",
    detail: "Placeholder — replace with a real review",
  },
  {
    quote:
      "I sent three reference photos for a bespoke piece and heard back within a day. Three fittings later it fits like it was always mine.",
    name: "Sample quote",
    detail: "Placeholder — replace with a real review",
  },
  {
    quote:
      "Heavier and better made than I expected from the photos. The studio box and card made it feel like an occasion, not just a delivery.",
    name: "Sample quote",
    detail: "Placeholder — replace with a real review",
  },
];

export default function Home() {
  const featured = FEATURED.map((slug) => products.find((p) => p.slug === slug)!).filter(Boolean);

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[92vh] items-end overflow-hidden bg-charcoal text-ivory">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={STOCK.heroEditorial}
            alt=""
            className="h-full w-full object-cover opacity-80"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-charcoal/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/70 via-transparent to-transparent" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.24em] text-copper-soft">Handcrafted in small batches</p>
          <h1 className="mt-5 max-w-2xl font-display text-[2.75rem] leading-[1.05] sm:text-6xl lg:text-7xl">
            Jewelry shaped by material, meaning and instinct.
          </h1>
          <p className="mt-6 max-w-md text-base text-ivory/75 sm:text-lg">
            Sculptural pieces handcrafted in limited quantities, designed to carry
            meaning beyond the object.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/shop"
              className="bg-copper px-8 py-4 text-sm uppercase tracking-[0.14em] text-ivory transition hover:bg-copper-soft"
            >
              Shop the Collection
            </Link>
            <Link
              href="/story"
              className="border border-ivory/40 px-8 py-4 text-sm uppercase tracking-[0.14em] transition hover:border-ivory"
            >
              Discover AKH
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between border-b border-ink/10 pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-copper">Featured</p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl">Recent pieces</h2>
          </div>
          <Link href="/shop" className="hidden text-sm text-ink/70 underline underline-offset-4 hover:text-copper sm:block">
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
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="aspect-[4/5] w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={STOCK.brandStoryProcess} alt="Hand-finishing a piece at the studio bench" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-copper-soft">The Studio</p>
            <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              One studio, one bench, every piece made by hand.
            </h2>
            <p className="mt-6 text-ivory/75">
              AKH is a one-studio jewelry practice working in sterling silver and gold,
              set with hand-selected stones — emeralds, sapphires, garnets, spinel,
              kunzite. Every piece is carved, cast, set and finished on the same
              bench, in small batches rather than continuous production runs.
            </p>
            <p className="mt-4 text-ivory/75">
              The starting point is never a trend. It&apos;s a line from a prayer, the
              color of a childhood flower field, or a stone that only makes sense
              worn at night. What makes the process distinctive is what it refuses
              to do: nothing here is mass-produced, and certified stones travel
              with their own paperwork.
            </p>
            <Link href="/story" className="mt-7 inline-block border-b border-copper-soft text-sm text-copper-soft">
              Read the full story
            </Link>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.18em] text-copper">Shop by category</p>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl">Find your piece</h2>
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
            <p className="text-xs uppercase tracking-[0.18em] text-copper">Craftsmanship</p>
            <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              From wax to worn: how a piece gets made.
            </h2>
            <div className="mt-8 space-y-6">
              {[
                ["Carve", "Every design starts as a hand-carved wax model, not a CAD file."],
                ["Cast", "Sterling silver or gold is cast from that wax original in small batches."],
                ["Set", "Hand-selected stones are set and checked individually under magnification."],
                ["Finish", "Each piece is polished, inspected and packed by hand at the same bench."],
              ].map(([step, copy]) => (
                <div key={step} className="flex gap-5">
                  <span className="font-display text-xl text-copper">{step}</span>
                  <p className="text-sm text-ink/70">{copy}</p>
                </div>
              ))}
            </div>
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
          <p className="text-xs uppercase tracking-[0.18em] text-copper-soft">Bespoke</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl">A piece made only for you</h2>
          <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["01", "Share your idea", "Tell us the meaning, occasion or reference behind the piece."],
              ["02", "Select materials", "Choose your metal and stone from our sourced selection, or bring your own."],
              ["03", "Approve the design", "Review a hand-drawn concept and a 3D render before anything is made."],
              ["04", "Your piece is handcrafted", "Carved, cast and finished on our bench, then shipped with its own story."],
            ].map(([n, title, copy]) => (
              <div key={n as string}>
                <span className="font-display text-3xl text-copper-soft">{n}</span>
                <h3 className="mt-3 text-base">{title}</h3>
                <p className="mt-2 text-sm text-ivory/65">{copy}</p>
              </div>
            ))}
          </div>
          <Link
            href="/bespoke"
            className="mt-12 inline-block bg-copper px-8 py-4 text-sm uppercase tracking-[0.14em] text-ivory transition hover:bg-copper-soft"
          >
            Begin a Bespoke Piece
          </Link>
        </div>
      </section>

      {/* Social Proof */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.18em] text-copper">In their words</p>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl">From the studio&apos;s customers</h2>
        <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="border-t border-ink/15 pt-6">
              <blockquote className="font-display text-lg leading-snug text-ink">“{t.quote}”</blockquote>
              <figcaption className="mt-4 text-sm text-ink/60">
                {t.name} · {t.detail}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Final Brand Moment */}
      <section className="relative flex min-h-[65vh] items-center overflow-hidden bg-ink text-ivory">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={STOCK.finalMoment} alt="" className="h-full w-full object-cover opacity-60" />
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
            className="mt-9 inline-block bg-copper px-9 py-4 text-sm uppercase tracking-[0.14em] transition hover:bg-copper-soft"
          >
            Shop the Collection
          </Link>
        </div>
      </section>
    </>
  );
}
