/**
 * One-time seed: inserts the 15 real legacy products into Supabase.
 * Run once against a fresh database: `npm run seed`
 * Safe to re-run - upserts on slug, so it won't duplicate rows.
 */
import { legacyProducts } from "../src/lib/legacy-products-seed";
import { supabaseAdmin } from "../src/lib/supabase/server";

// Matches the homepage's old hardcoded SELECTED/HERO_PRODUCT arrays
// (src/app/(site)/page.tsx, pre-CMS) so the live homepage looks identical
// right after seeding, before the owner changes anything in /admin.
const FEATURED_SLUGS = ["vahavta-ring", "hai-pendant", "anemone", "maslul"];
const HERO_SLUG = "anemone";

async function main() {
  const db = supabaseAdmin();
  let created = 0;
  let updated = 0;

  for (const p of legacyProducts) {
    const row = {
      slug: p.slug,
      name: p.name,
      category: p.category,
      price: p.price,
      currency: p.currency,
      material: p.material,
      stone: p.stone ?? null,
      measurements: p.measurements,
      weight: p.weight ?? null,
      available_sizes: p.availableSizes ?? null,
      availability: p.availability,
      dispatch: p.dispatch,
      limited_edition: p.limitedEdition ?? null,
      images: p.images,
      tagline: p.tagline,
      description: p.description,
      story: p.story,
      craftsmanship: p.craftsmanship,
      care: p.care,
      is_featured: FEATURED_SLUGS.includes(p.slug),
      is_hero: p.slug === HERO_SLUG,
      is_published: true,
    };

    const { data: existing } = await db.from("products").select("id").eq("slug", p.slug).maybeSingle();

    if (existing) {
      const { error } = await db.from("products").update(row).eq("slug", p.slug);
      if (error) throw new Error(`Update failed for ${p.slug}: ${error.message}`);
      updated++;
    } else {
      const { error } = await db.from("products").insert(row);
      if (error) throw new Error(`Insert failed for ${p.slug}: ${error.message}`);
      created++;
    }
  }

  console.log(`Seed complete: ${created} created, ${updated} updated (of ${legacyProducts.length} total).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
