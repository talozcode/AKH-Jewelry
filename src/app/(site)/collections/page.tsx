import type { Metadata } from "next";
import Link from "next/link";
import { getCollections } from "@/lib/collections";
import { wixImg } from "@/lib/wixImage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Collections",
  description: "Curated collections from the AKH studio.",
};

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl sm:text-4xl">Collections</h1>
      <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((c) => (
          <Link key={c.slug} href={`/collections/${c.slug}`} className="group block">
            <div className="aspect-[4/5] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={wixImg(c.heroImageUrl, 900, 1125)}
                alt={c.heroImageAlt}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <h2 className="mt-4 font-display text-xl">{c.name}</h2>
            <p className="mt-1 text-sm text-ink/60">{c.tagline}</p>
          </Link>
        ))}
      </div>
      {collections.length === 0 ? <p className="mt-16 text-center text-ink/50">No collections published yet.</p> : null}
    </div>
  );
}
