import { Suspense } from "react";
import type { Metadata } from "next";
import { getProducts } from "@/lib/products";
import { ShopClient } from "./ShopClient";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse AKH's full collection of sculptural rings, necklaces and bracelets, handcrafted in small batches.",
};

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await getProducts();
  return (
    <Suspense fallback={null}>
      <ShopClient products={products} />
    </Suspense>
  );
}
