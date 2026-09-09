import { getLegacyProductBySlug } from "@/lib/legacy-products-seed";

// Single source of truth for the content every concept shows, so the four
// design directions differ only in styling, never in substance. See
// CLAUDE.md / the plan for this page: fair comparison means identical
// products, prices and copy across all four.
//
// Deliberately reads the frozen legacy seed data, not the live Supabase-backed
// src/lib/products.ts — this page is a historical record (see CLAUDE.md) and
// stays decoupled from live DB state on purpose.
export const cardProducts = ["anemone", "hai-pendant", "tsil-bangle"].map(
  (slug) => getLegacyProductBySlug(slug)!
);

export const heroProduct = getLegacyProductBySlug("anemone")!;
export const quoteProduct = getLegacyProductBySlug("levone")!;
