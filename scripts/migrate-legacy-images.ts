/**
 * One-time migration: re-hosts every legacy Wix product photo and Pexels
 * mood photo into Supabase Storage, so the site no longer hotlinks to
 * third-party CDNs it doesn't control. Run once: `npm run migrate:images`
 *
 * Safe to re-run: any `images[]` entry that's already a Storage URL
 * (starts with "http", per wixImg()'s own pass-through rule) is skipped,
 * so a partial prior run or a mixed legacy/new product is handled
 * correctly rather than re-uploading duplicates.
 *
 * Downloads the ORIGINAL Wix file (no `/v1/fill/...` transform suffix),
 * not a resized crop, so no aspect-ratio crop gets baked in permanently;
 * the fill transform was only ever meant for on-the-fly display sizing.
 * Resize pipeline matches uploadProductImageAction's: 1800px longest
 * edge, fit "inside" (no crop), jpeg q88.
 */
import sharp from "sharp";
import { getAllProductsForAdmin, updateProduct } from "../src/lib/products";
import { STOCK } from "../src/lib/stockImages";
import { supabaseAdmin } from "../src/lib/supabase/server";

const SITE_PREFIX = "4bc845_";

function originalWixUrl(idExt: string): string {
  const dot = idExt.lastIndexOf(".");
  const id = SITE_PREFIX + idExt.slice(0, dot);
  const ext = idExt.slice(dot + 1);
  return `https://static.wixstatic.com/media/${id}~mv2.${ext}`;
}

async function fetchBytes(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${url}: ${res.status} ${res.statusText}`);
  return Buffer.from(await res.arrayBuffer());
}

async function resizeToJpeg(bytes: Buffer): Promise<Buffer> {
  return sharp(bytes)
    .rotate()
    .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
    .toFormat("jpeg", { quality: 88 })
    .toBuffer();
}

async function migrateProductImages() {
  const db = supabaseAdmin();
  const products = await getAllProductsForAdmin();
  let uploaded = 0;
  let skipped = 0;

  for (const product of products) {
    const newImages: string[] = [];
    let changed = false;

    for (const entry of product.images) {
      if (entry.startsWith("http")) {
        newImages.push(entry);
        skipped++;
        continue;
      }

      const sourceUrl = originalWixUrl(entry);
      console.log(`  downloading ${product.slug}: ${entry}`);
      const original = await fetchBytes(sourceUrl);
      const resized = await resizeToJpeg(original);

      const path = `products/${crypto.randomUUID()}.jpg`;
      const { error: uploadError } = await db.storage
        .from("product-images")
        .upload(path, resized, { contentType: "image/jpeg", upsert: false });
      if (uploadError) throw new Error(`upload ${product.slug}/${entry}: ${uploadError.message}`);

      const { data } = db.storage.from("product-images").getPublicUrl(path);
      newImages.push(data.publicUrl);
      changed = true;
      uploaded++;
    }

    if (changed) {
      await updateProduct(product.id!, { ...product, images: newImages });
      console.log(`updated ${product.slug}: ${newImages.length} image(s)`);
    }
  }

  console.log(`Product images: ${uploaded} uploaded, ${skipped} already migrated/skipped.`);
}

/**
 * Mood photography lives in `pages` rows (home.editorialImageUrl,
 * story.heroImageUrl, bespoke.heroImageUrl), not on a product, so each
 * usage is updated with a direct jsonb field patch keyed by page/field
 * rather than going through mergePageContent. Both home.editorialImageUrl
 * and story.heroImageUrl currently point at the SAME Pexels photo
 * (STOCK.brandStoryProcess), so it's uploaded once and the resulting URL
 * is reused for both, avoiding a duplicate Storage asset.
 */
async function migrateMoodPhotos() {
  const db = supabaseAdmin();
  const uploadedUrlByPexelsUrl = new Map<string, string>();

  async function uploadMoodPhoto(pexelsUrl: string, filename: string): Promise<string> {
    const existing = uploadedUrlByPexelsUrl.get(pexelsUrl);
    if (existing) return existing;

    console.log(`  downloading mood photo: ${filename}`);
    const original = await fetchBytes(pexelsUrl);
    const resized = await resizeToJpeg(original);

    const path = `site/${crypto.randomUUID()}.jpg`;
    const { error: uploadError } = await db.storage
      .from("site-media")
      .upload(path, resized, { contentType: "image/jpeg", upsert: false });
    if (uploadError) throw new Error(`upload ${filename}: ${uploadError.message}`);

    const { data } = db.storage.from("site-media").getPublicUrl(path);

    const { error: dbError } = await db.from("media_assets").insert({
      url: data.publicUrl,
      storage_path: path,
      filename,
    });
    if (dbError) throw new Error(`media_assets insert for ${filename}: ${dbError.message}`);

    uploadedUrlByPexelsUrl.set(pexelsUrl, data.publicUrl);
    return data.publicUrl;
  }

  const brandStoryUrl = await uploadMoodPhoto(STOCK.brandStoryProcess, "brand-story-process");
  const bespokeUrl = await uploadMoodPhoto(STOCK.bespokeEditorial, "bespoke-editorial");

  const targets: { page: string; field: string; url: string }[] = [
    { page: "home", field: "editorialImageUrl", url: brandStoryUrl },
    { page: "story", field: "heroImageUrl", url: brandStoryUrl },
    { page: "bespoke", field: "heroImageUrl", url: bespokeUrl },
  ];

  for (const { page, field, url } of targets) {
    const { data: row, error: readError } = await db.from("pages").select("content").eq("key", page).maybeSingle();
    if (readError) throw new Error(`read pages/${page}: ${readError.message}`);
    if (!row) throw new Error(`pages row missing for key "${page}"`);
    // Only patch if the field still points at the original Pexels URL, so
    // a re-run never clobbers an owner's own edit made in the meantime.
    const content = row.content as Record<string, unknown>;
    if (content[field] !== STOCK.brandStoryProcess && content[field] !== STOCK.bespokeEditorial) {
      console.log(`  skipping ${page}.${field}: already changed from the Pexels default`);
      continue;
    }
    const { error: writeError } = await db
      .from("pages")
      .update({ content: { ...content, [field]: url } })
      .eq("key", page);
    if (writeError) throw new Error(`update pages/${page}: ${writeError.message}`);
    console.log(`updated ${page}.${field}`);
  }
}

async function main() {
  console.log("Migrating product images off static.wixstatic.com...");
  await migrateProductImages();
  console.log("Migrating mood photography off images.pexels.com...");
  await migrateMoodPhotos();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
