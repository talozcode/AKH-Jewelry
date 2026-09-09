import { supabaseAdmin } from "./supabase/server";

export type MediaAsset = {
  id: string;
  url: string;
  storagePath: string;
  filename: string;
  uploadedAt: string;
};

/** Admin only — call `requireAdminAction()`/`requireAdminPage()` before this. */
export async function listMediaAssets(): Promise<MediaAsset[]> {
  const { data, error } = await supabaseAdmin().from("media_assets").select("*").order("uploaded_at", { ascending: false });
  if (error) throw new Error(`listMediaAssets: ${error.message}`);
  return (data ?? []).map((row) => ({
    id: row.id,
    url: row.url,
    storagePath: row.storage_path,
    filename: row.filename,
    uploadedAt: row.uploaded_at,
  }));
}

/** Admin only — call `requireAdminAction()` before this. */
export async function deleteMediaAsset(id: string): Promise<void> {
  const db = supabaseAdmin();
  const { data: asset, error: fetchError } = await db.from("media_assets").select("storage_path").eq("id", id).maybeSingle();
  if (fetchError) throw new Error(`deleteMediaAsset: ${fetchError.message}`);
  if (asset) {
    const { error: storageError } = await db.storage.from("site-media").remove([asset.storage_path]);
    if (storageError) throw new Error(`deleteMediaAsset (storage): ${storageError.message}`);
  }
  const { error } = await db.from("media_assets").delete().eq("id", id);
  if (error) throw new Error(`deleteMediaAsset: ${error.message}`);
}
