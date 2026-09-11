import { cache } from "react";
import { supabaseAdmin } from "./supabase/server";
import type { Database } from "./supabase/database.types";

type Row = Database["public"]["Tables"]["collections"]["Row"];

export type Collection = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  intro: string;
  heroImageUrl: string;
  heroImageAlt: string;
  story: string;
  productSlugs: string[];
  isPublished: boolean;
};

function rowToCollection(row: Row): Collection {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    intro: row.intro,
    heroImageUrl: row.hero_image_url,
    heroImageAlt: row.hero_image_alt,
    story: row.story,
    productSlugs: row.product_slugs,
    isPublished: row.is_published,
  };
}

export const getCollections = cache(async function getCollections(): Promise<Collection[]> {
  const { data, error } = await supabaseAdmin()
    .from("collections")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(`getCollections: ${error.message}`);
  return (data ?? []).map(rowToCollection);
});

export const getAllCollectionsForAdmin = cache(async function getAllCollectionsForAdmin(): Promise<Collection[]> {
  const { data, error } = await supabaseAdmin()
    .from("collections")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(`getAllCollectionsForAdmin: ${error.message}`);
  return (data ?? []).map(rowToCollection);
});

export const getCollectionBySlug = cache(async function getCollectionBySlug(slug: string): Promise<Collection | undefined> {
  const { data, error } = await supabaseAdmin().from("collections").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(`getCollectionBySlug: ${error.message}`);
  return data ? rowToCollection(data) : undefined;
});

export async function getCollectionById(id: string): Promise<Collection | undefined> {
  const { data, error } = await supabaseAdmin().from("collections").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`getCollectionById: ${error.message}`);
  return data ? rowToCollection(data) : undefined;
}

type CollectionInput = Omit<Collection, "id">;

function collectionToRow(collection: CollectionInput) {
  return {
    slug: collection.slug,
    name: collection.name,
    tagline: collection.tagline,
    intro: collection.intro,
    hero_image_url: collection.heroImageUrl,
    hero_image_alt: collection.heroImageAlt,
    story: collection.story,
    product_slugs: collection.productSlugs,
    is_published: collection.isPublished,
  };
}

/** Admin only - call `requireAdminAction()` before this. */
export async function createCollection(collection: CollectionInput): Promise<Collection> {
  const { data, error } = await supabaseAdmin().from("collections").insert(collectionToRow(collection)).select().single();
  if (error) throw new Error(`createCollection: ${error.message}`);
  return rowToCollection(data);
}

/** Admin only - call `requireAdminAction()` before this. */
export async function updateCollection(id: string, collection: CollectionInput): Promise<Collection> {
  const { data, error } = await supabaseAdmin()
    .from("collections")
    .update(collectionToRow(collection))
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`updateCollection: ${error.message}`);
  return rowToCollection(data);
}

/** Admin only - call `requireAdminAction()` before this. */
export async function deleteCollection(id: string): Promise<void> {
  const { error } = await supabaseAdmin().from("collections").delete().eq("id", id);
  if (error) throw new Error(`deleteCollection: ${error.message}`);
}
