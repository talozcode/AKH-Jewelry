import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollectionBySlug } from "@/lib/collections";
import { getProductBySlug } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { wixImg } from "@/lib/wixImage";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const collection = await getCollectionBySlug(slug);
  if (!collection || !collection.isPublished) return {};
  return {
    title: collection.name,
    description: collection.tagline,
  };
}

export default async function CollectionPage(props: PageProps<"/collections/[slug]">) {
  const { slug } = await props.params;
  const collection = await getCollectionBySlug(slug);
  if (!collection || !collection.isPublished) notFound();

  const resolved = await Promise.all(collection.productSlugs.map((s) => getProductBySlug(s)));
  const products = resolved.filter((p) => p && p.isPublished !== false);

  return (
    <div>
      <section className="relative flex min-h-[50vh] items-end overflow-hidden bg-charcoal text-ivory">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={wixImg(collection.heroImageUrl, 1800, 1000)} alt={collection.heroImageAlt} className="h-full w-full object-cover opacity-80" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-charcoal/10" />
        <div className="relative mx-auto w-full max-w-5xl px-4 pb-14 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">{collection.name}</h1>
          <p className="mt-3 max-w-xl text-ivory/80">{collection.tagline}</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <p className="text-ink/75">{collection.intro}</p>
      </section>

      {products.length ? (
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p!.slug} product={p!} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="bg-ivory-deep">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="font-display text-lg italic leading-relaxed text-ink/80">{collection.story}</p>
        </div>
      </section>
    </div>
  );
}
