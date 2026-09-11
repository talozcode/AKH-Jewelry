/**
 * Builds a resized Wix media URL from the raw akhjewelry.com image ids
 * (format "<id>.<ext>", e.g. "682d76e02811499b9d6b09bab93722ba.jpg").
 * Uses Wix's own image service (`fill` mode) so we never have to store
 * or re-host the original files.
 *
 * Since the CMS shipped, `images[]` on a product can also hold a full URL
 * (a Supabase Storage public URL for an owner-uploaded photo) instead of a
 * bare Wix id - those pass through unchanged, since Supabase Storage has no
 * equivalent on-the-fly resize service.
 */
// All akhjewelry.com media lives under this Wix site media owner prefix.
const SITE_PREFIX = "4bc845_";

export function wixImg(idExt: string, w = 900, h = 1125) {
  if (idExt.startsWith("http")) return idExt;

  const dot = idExt.lastIndexOf(".");
  const id = SITE_PREFIX + idExt.slice(0, dot);
  const ext = idExt.slice(dot + 1);
  return `https://static.wixstatic.com/media/${id}~mv2.${ext}/v1/fill/w_${w},h_${h},al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/${id}~mv2.${ext}`;
}
