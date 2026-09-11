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

export const getProductBySlug = cache(async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const { data, error } = await supabaseAdmin().from("products").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(`getProductBySlug: ${error.message}`);
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
