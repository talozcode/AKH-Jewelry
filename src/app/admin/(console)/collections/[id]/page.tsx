import { notFound } from "next/navigation";
import { getCollectionById } from "@/lib/collections";
import { getAllProductsForAdmin } from "@/lib/products";
import { listMediaAssets } from "@/lib/media";
import { CollectionForm } from "../CollectionForm";

export const dynamic = "force-dynamic";

export default async function EditCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [collection, allProducts, mediaAssets] = await Promise.all([
    getCollectionById(id),
    getAllProductsForAdmin(),
    listMediaAssets(),
  ]);
  if (!collection) notFound();

  return (
    <div>
      <h1 className="text-2xl font-medium">{collection.name}</h1>
      <div className="mt-8">
        <CollectionForm collection={collection} allProducts={allProducts} mediaAssets={mediaAssets} />
      </div>
    </div>
  );
}
