import { getProductBySlug } from "@/lib/products";

// Single source of truth for the content every concept shows, so the four
// design directions differ only in styling, never in substance. See
// CLAUDE.md / the plan for this page: fair comparison means identical
// products, prices and copy across all four.
export const cardProducts = ["anemone", "hai-pendant", "tsil-bangle"].map(
  (slug) => getProductBySlug(slug)!
);

export const heroProduct = getProductBySlug("anemone")!;
export const quoteProduct = getProductBySlug("levone")!;
