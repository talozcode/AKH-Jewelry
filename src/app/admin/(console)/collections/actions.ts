"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/admin/auth";
import { createCollection, deleteCollection, getCollectionById, updateCollection } from "@/lib/collections";
import type { Collection } from "@/lib/collections";

type CollectionInput = Omit<Collection, "id">;

function revalidateCollections(slugs: string[]) {
  revalidatePath("/collections");
  for (const slug of slugs) revalidatePath(`/collections/${slug}`);
  revalidatePath("/admin/collections");
}

export async function createCollectionAction(
  input: CollectionInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await requireAdminAction();
  try {
    const collection = await createCollection(input);
    revalidateCollections([collection.slug]);
    return { ok: true, id: collection.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to create collection" };
  }
}

export async function updateCollectionAction(
  id: string,
  input: CollectionInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminAction();
  try {
    const previous = await getCollectionById(id);
    const updated = await updateCollection(id, input);
    revalidateCollections(previous && previous.slug !== updated.slug ? [previous.slug, updated.slug] : [updated.slug]);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update collection" };
  }
}

export async function deleteCollectionAction(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminAction();
  try {
    const collection = await getCollectionById(id);
    await deleteCollection(id);
    if (collection) revalidateCollections([collection.slug]);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to delete collection" };
  }
}
