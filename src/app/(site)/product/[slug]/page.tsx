import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts, getRelated } from "@/lib/products";
import { getSiteSettings } from "@/lib/site-settings";
import { formatPrice } from "@/lib/format";
import { Gallery } from "@/components/Gallery";
import { PurchaseArea, StickyMobileBar } from "@/components/PurchaseArea";
import { Accordion } from "@/components/Accordion";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} | AKH Jewelry`,
      description: product.tagline,
    },
  };
}

export default async function ProductPage(props: PageProps<"/product/[slug]">) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, settings] = await Promise.all([getRelated(product, 4), getSiteSettings()]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    material: product.material,
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency,
      price: product.price,
      availability:
        product.availability === "In Stock"
          ? "https://schema.org/InStock"
          : product.availability === "Out of Stock"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/PreOrder",
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Shop", item: "/shop" },
      { "@type": "ListItem", position: 2, name: product.category, item: `/shop?category=${product.category}` },
      { "@type": "ListItem", position: 3, name: product.name },
    ],
  };

  return (
    <div className="pb-24 md:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav className="mx-auto max-w-7xl px-4 pt-6 text-xs text-ink/50 sm:px-6 lg:px-8">
        <Link href="/shop" className="hover:text-copper">Shop</Link>
        <span className="mx-2">/</span>
        <Link href={`/shop?category=${product.category}`} className="hover:text-copper">{product.category}</Link>
        <span className="mx-2">/</span>
        <span className="text-ink/70">{product.name}</span>
      </nav>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:px-8">
        <Gallery product={product} />

        {/* scroll-mt-20: the sticky mobile "Buy Now" bar links here with
            #purchase - without this, scrolling the anchor flush to the top
            tucks it directly under the sticky header (h-16/64px), hiding
            the name/price/size-selector the tap was meant to reveal. */}
        <div id="purchase" className="scroll-mt-20">
          <h1 className="font-display text-3xl">{product.name}</h1>
          <p className="mt-1 font-display text-base italic text-mineral">{product.tagline}</p>
          <p className="mt-4 text-2xl text-ink">{formatPrice(product)}</p>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink/75">{product.description}</p>
          <blockquote className="mt-4 max-w-prose border-l-2 border-copper/50 pl-4 text-sm leading-relaxed text-ink/60 italic">
            {product.story}
          </blockquote>

          <dl className="mt-6 grid grid-cols-2 gap-y-2 border-t border-ink/10 pt-5 text-sm">
            <dt className="text-ink/50">Material</dt>
            <dd>{product.material}</dd>
            {product.stone ? (
              <>
                <dt className="text-ink/50">Stone</dt>
                <dd>{product.stone}</dd>
              </>
            ) : null}
            <dt className="text-ink/50">Measurements</dt>
            <dd>{product.measurements}</dd>
            {product.weight ? (
              <>
                <dt className="text-ink/50">Weight</dt>
                <dd>{product.weight}</dd>
              </>
            ) : null}
            <dt className="text-ink/50">Status</dt>
            <dd>{product.limitedEdition ?? "Core collection"}</dd>
          </dl>

          <div className="mt-8">
            <PurchaseArea product={product} contactEmail={settings.contactEmail} />
          </div>

          <div className="mt-10">
            <Accordion
              items={[
                { title: "Materials & Craftsmanship", content: product.craftsmanship },
                {
                  title: "Sizing",
                  content: product.availableSizes
                    ? `Available in sizes ${product.availableSizes.join(", ")}. Unsure of your size? Use our size guide before ordering.`
                    : "This piece is one size. See measurements above for exact fit.",
                },
                {
                  title: "Shipping & Returns",
                  content: `${product.dispatch}. Free returns within 14 days on in-stock pieces; made-to-order and one-of-one pieces are final sale. International orders may incur local customs duties.`,
                },
                { title: "Care Instructions", content: product.care },
              ]}
            />
          </div>
        </div>
      </div>

      {related.length ? (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl">You may also like</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      <StickyMobileBar product={product} />
    </div>
  );
}
