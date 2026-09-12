"use server";

import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { requireAdminAction } from "@/lib/admin/auth";
import { friendlyDbError } from "@/lib/admin/friendlyError";
import { createProduct, deleteProduct, getProductById, updateProduct } from "@/lib/products";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

type ProductInput = Omit<Product, "id">;

function revalidateStorefront(slugs: string[]) {
  revalidatePath("/");
  revalidatePath("/shop");
  for (const slug of slugs) revalidatePath(`/product/${slug}`);
}

export async function createProductAction(
  input: ProductInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await requireAdminAction();
  try {
    const product = await createProduct(input);
    revalidateStorefront([product.slug]);
    revalidatePath("/admin/products");
    return { ok: true, id: product.id! };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? friendlyDbError(err.message) : "Failed to create product" };
  }
}

export async function updateProductAction(
  id: string,
  input: ProductInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminAction();
  try {
    const previous = await getProductById(id);
    const updated = await updateProduct(id, input);
    revalidateStorefront(previous && previous.slug !== updated.slug ? [previous.slug, updated.slug] : [updated.slug]);
    revalidatePath("/admin/products");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? friendlyDbError(err.message) : "Failed to update product" };
  }
}

export async function deleteProductAction(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminAction();
  try {
    const product = await getProductById(id);
    await deleteProduct(id);
    if (product) revalidateStorefront([product.slug]);
    revalidatePath("/admin/products");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? friendlyDbError(err.message) : "Failed to delete product" };
  }
}

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function uploadProductImageAction(
  formData: FormData
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  await requireAdminAction();

  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file provided" };
  if (!ALLOWED_TYPES.includes(file.type)) return { ok: false, error: "Unsupported image type" };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: "Image is larger than 8MB" };

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    // Resize the longest edge down to 1800px so an unresized phone photo
    // never lands in Storage at full size - Wix's CDN used to do this for
    // free; Supabase Storage doesn't.
    const resized = await sharp(bytes)
      .rotate() // respect EXIF orientation before stripping it
      .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
      .toFormat("jpeg", { quality: 88 })
      .toBuffer();

    const path = `products/${crypto.randomUUID()}.jpg`;
    const db = supabaseAdmin();
    const { error: uploadError } = await db.storage
      .from("product-images")
      .upload(path, resized, { contentType: "image/jpeg", upsert: false });
    if (uploadError) return { ok: false, error: friendlyDbError(uploadError.message) };

    const { data } = db.storage.from("product-images").getPublicUrl(path);
    return { ok: true, url: data.publicUrl };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? friendlyDbError(err.message) : "Upload failed" };
  }
}
