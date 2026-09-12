"use server";

import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { requireAdminAction } from "@/lib/admin/auth";
import { friendlyDbError } from "@/lib/admin/friendlyError";
import { deleteMediaAsset } from "@/lib/media";
import { supabaseAdmin } from "@/lib/supabase/server";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function uploadSiteMediaAction(
  formData: FormData
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  await requireAdminAction();

  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file provided" };
  if (!ALLOWED_TYPES.includes(file.type)) return { ok: false, error: "Unsupported image type" };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: "Image is larger than 8MB" };

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const resized = await sharp(bytes)
      .rotate()
      .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
      .toFormat("jpeg", { quality: 88 })
      .toBuffer();

    const filename = file.name.replace(/\.[^.]+$/, "") || "image";
    const path = `site/${crypto.randomUUID()}.jpg`;
    const db = supabaseAdmin();
    const { error: uploadError } = await db.storage
      .from("site-media")
      .upload(path, resized, { contentType: "image/jpeg", upsert: false });
    if (uploadError) return { ok: false, error: friendlyDbError(uploadError.message) };

    const { data } = db.storage.from("site-media").getPublicUrl(path);

    const { error: dbError } = await db
      .from("media_assets")
      .insert({ url: data.publicUrl, storage_path: path, filename });
    if (dbError) return { ok: false, error: friendlyDbError(dbError.message) };

    revalidatePath("/admin/media");
    return { ok: true, url: data.publicUrl };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? friendlyDbError(err.message) : "Upload failed" };
  }
}

export async function deleteSiteMediaAction(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminAction();
  try {
    await deleteMediaAsset(id);
    revalidatePath("/admin/media");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? friendlyDbError(err.message) : "Delete failed" };
  }
}
