/**
 * One-time seed: inserts the transcribed current hardcoded copy into
 * `pages` and `site_settings`. Run once: `npm run seed:pages`
 * Safe to re-run - upserts, so it won't duplicate rows.
 */
import { DEFAULTS } from "../src/lib/pages";
import { DEFAULT_SETTINGS } from "../src/lib/site-settings";
import { supabaseAdmin } from "../src/lib/supabase/server";

async function main() {
  const db = supabaseAdmin();

  for (const [key, content] of Object.entries(DEFAULTS)) {
    const { error } = await db.from("pages").upsert({ key, content }, { onConflict: "key" });
    if (error) throw new Error(`pages seed failed for ${key}: ${error.message}`);
    console.log(`seeded page: ${key}`);
  }

  const { error } = await db
    .from("site_settings")
    .upsert(
      {
        id: 1,
        contact_email: DEFAULT_SETTINGS.contactEmail,
        contact_phone: DEFAULT_SETTINGS.contactPhone ?? null,
        whatsapp_number: DEFAULT_SETTINGS.whatsappNumber ?? null,
        instagram_url: DEFAULT_SETTINGS.instagramUrl ?? null,
        tiktok_url: DEFAULT_SETTINGS.tiktokUrl ?? null,
        footer_blurb: DEFAULT_SETTINGS.footerBlurb,
      },
      { onConflict: "id" }
    );
  if (error) throw new Error(`site_settings seed failed: ${error.message}`);
  console.log("seeded site_settings");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
