import { cache } from "react";
import { supabaseAdmin } from "./supabase/server";
import type { Database } from "./supabase/database.types";
import { Product } from "./types";

type Row = Database["public"]["Tables"]["products"]["Row"];

function rowToProduct(row: Row): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    price: row.price,
    currency: row.currency,
    material: row.material,
    stone: row.stone ?? undefined,
    measurements: row.measurements,
    weight: row.weight ?? undefined,
    availableSizes: row.available_sizes ?? undefined,
    availability: row.availability,
    stockQuantity: row.stock_quantity,
    dispatch: row.dispatch,
    limitedEdition: row.limited_edition ?? undefined,
    images: row.images,
    tagline: row.tagline,
    description: row.description,
    story: row.story,
    craftsmanship: row.craftsmanship,
    care: row.care,
    isFeatured: row.is_featured,
    isHero: row.is_hero,
    isPublished: row.is_published,
  };
}

/**
 * All published products, ordered for display (sort_order, then name).
 * Cached per-request (React `cache`) so a page that calls this more than
 * once doesn't re-query. Use `getAllProductsForAdmin()` in /admin, which
 * includes unpublished drafts.
 */
export const getProducts = cache(async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabaseAdmin()
    .from("products")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(`getProducts: ${error.message}`);
  return (data ?? []).map(rowToProduct);
});

/** Every product regardless of publish state - for the admin product list. */
export const getAllProductsForAdmin = cache(async function getAllProductsForAdmin(): Promise<Product[]> {
  const { data, error } = await supabaseAdmin()
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(`getAllProductsForAdmin: ${error.message}`);
  return (data ?? []).map(rowToProduct);
});

/**
 * Storefront-only lookup: filters `is_published` exactly like getProducts/
 * getFeaturedProducts/getHeroProduct do, unlike getProductById (used only
 * by the admin, which legitimately needs to see drafts). Before this
 * filter existed, a draft/unpublished product's full page - name, photos,
 * price, story, and a live-looking Buy button - was fully public and
 * crawlable to anyone who had or guessed its slug, even though checkout
 * itself was always safely rejected server-side by checkPurchasable.
 */
export const getProductBySlug = cache(async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const { data, error } = await supabaseAdmin().from("products").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
  // Unlike every other lookup in this file, `slug` here is a raw, fully
  // attacker-controlled route param (e.g. /product/OR1=1 reliably makes
  // PostgREST return a query error, confirmed live). A real infra failure
  // and an adversarial slug look identical to the caller either way, and
  // a visitor-facing product page should 404 on either rather than crash
  // with an unhandled exception (this app has no error boundary anywhere)
  // - logged loudly so a real outage is still visible in server logs.
  if (error) {
    console.error(`getProductBySlug(${slug}) failed:`, error.message);
    return undefined;
  }
  return data ? rowToProduct(data) : undefined;
});

export async function getProductById(id: string): Promise<Product | undefined> {
  const { data, error } = await supabaseAdmin().from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`getProductById: ${error.message}`);
  return data ? rowToProduct(data) : undefined;
}

export async function getRelated(product: Product, max = 4): Promise<Product[]> {
  const all = await getProducts();
  return all
    .filter((p) => p.slug !== product.slug && p.category === product.category)
    .slice(0, max)
    .concat(all.filter((p) => p.slug !== product.slug && p.category !== product.category))
    .slice(0, max);
}

export async function getFeaturedProducts(max = 4): Promise<Product[]> {
  const { data, error } = await supabaseAdmin()
    .from("products")
    .select("*")
    .eq("is_published", true)
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .limit(max);
  if (error) throw new Error(`getFeaturedProducts: ${error.message}`);
  return (data ?? []).map(rowToProduct);
}

export async function getHeroProduct(): Promise<Product | undefined> {
  const { data, error } = await supabaseAdmin()
    .from("products")
    .select("*")
    .eq("is_published", true)
    .eq("is_hero", true)
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`getHeroProduct: ${error.message}`);
  return data ? rowToProduct(data) : undefined;
}

type ProductInput = Omit<Product, "id"> & { id?: string };

function productToRow(product: ProductInput) {
  return {
    slug: product.slug,
    name: product.name,
    category: product.category,
    price: product.price,
    currency: product.currency,
    material: product.material,
    stone: product.stone ?? null,
    measurements: product.measurements,
    weight: product.weight ?? null,
    available_sizes: product.availableSizes ?? null,
    availability: product.availability,
    // Not tracked unless availability is "In Stock" - forced to null
    // otherwise so switching a product to Made to Order/Out of Stock can't
    // leave a stale tracked count sitting unused underneath it.
    stock_quantity: product.availability === "In Stock" ? (product.stockQuantity ?? null) : null,
    dispatch: product.dispatch,
    limited_edition: product.limitedEdition ?? null,
    images: product.images,
    tagline: product.tagline,
    description: product.description,
    story: product.story,
    craftsmanship: product.craftsmanship,
    care: product.care,
    is_featured: product.isFeatured ?? false,
    is_hero: product.isHero ?? false,
    is_published: product.isPublished ?? true,
  };
}

/** Admin only - call `requireAdmin()` before this. */
export async function createProduct(product: ProductInput): Promise<Product> {
  const { data, error } = await supabaseAdmin().from("products").insert(productToRow(product)).select().single();
  if (error) throw new Error(`createProduct: ${error.message}`);
  return rowToProduct(data);
}

/** Admin only - call `requireAdmin()` before this. */
export async function updateProduct(id: string, product: ProductInput): Promise<Product> {
  const { data, error } = await supabaseAdmin()
    .from("products")
    .update(productToRow(product))
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`updateProduct: ${error.message}`);
  return rowToProduct(data);
}

/** Admin only - call `requireAdmin()` before this. */
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabaseAdmin().from("products").delete().eq("id", id);
  if (error) throw new Error(`deleteProduct: ${error.message}`);
}

/**
 * A narrow single-column update, deliberately NOT `updateProduct(id,
 * {...product, availability})`. That pattern writes every column from a
 * `product` read moments earlier, so a concurrent admin edit to the same
 * row (made between that read and this write) gets silently clobbered - a
 * pre-existing lost-update bug in the webhook's own availability flip,
 * fixed here by only ever touching the one column it actually means to
 * change.
 */
export async function setProductAvailability(id: string, availability: Product["availability"]): Promise<void> {
  const { error } = await supabaseAdmin().from("products").update({ availability }).eq("id", id);
  if (error) throw new Error(`setProductAvailability: ${error.message}`);
}

/**
 * Pure decision table for what a paid order should do to a product's
 * inventory, extracted so the whole matrix is one thing to read and test
 * (products.test.ts) rather than inline branches in the webhook handler:
 *
 * | availability   | stockQuantity | effect                 |
 * |----------------|---------------|------------------------|
 * | In Stock       | null          | flip to Out of Stock   |
 * | In Stock       | N > 0         | decrement              |
 * | Made to Order  | (any)         | none: unbounded, never flipped |
 * | Out of Stock   | (any)         | none: already reflects reality |
 *
 * "decrement" doesn't say what the new quantity turned out to be - that's
 * only knowable after the atomic RPC call actually runs (see
 * decrement_product_stock in supabase/migrations/0008_product_stock.sql),
 * which is why this stays a pure decision of WHETHER to call it, not a
 * prediction of its result.
 */
export type InventoryEffect = "none" | "flip_to_out_of_stock" | "decrement";

export function decideInventoryEffect(product: Pick<Product, "availability" | "stockQuantity">): InventoryEffect {
  if (product.availability !== "In Stock") return "none";
  if (product.stockQuantity === null || product.stockQuantity === undefined) return "flip_to_out_of_stock";
  return "decrement";
}
