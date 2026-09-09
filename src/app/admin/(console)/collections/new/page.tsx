import { getAllProductsForAdmin } from "@/lib/products";
import { listMediaAssets } from "@/lib/media";
import { CollectionForm } from "../CollectionForm";

export const dynamic = "force-dynamic";

export default async function NewCollectionPage() {
  const [allProducts, mediaAssets] = await Promise.all([getAllProductsForAdmin(), listMediaAssets()]);

  return (
    <div>
      <h1 className="text-2xl font-medium">New collection</h1>
      <div className="mt-8">
        <CollectionForm allProducts={allProducts} mediaAssets={mediaAssets} />
      </div>
    </div>
  );
}
