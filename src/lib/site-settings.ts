import { cache } from "react";
import { supabaseAdmin } from "./supabase/server";

export type SiteSettings = {
  contactEmail: string;
  contactPhone?: string;
  whatsappNumber?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  footerBlurb: string;
};

// Exact current hardcoded values, transcribed from Footer.tsx/contact/page.tsx
// — the seed source and the fallback if the singleton row is ever missing.
export const DEFAULT_SETTINGS: SiteSettings = {
  contactEmail: "hello@akhjewelry.com",
  instagramUrl: "https://www.instagram.com/akhjewelry",
  tiktokUrl: "https://www.tiktok.com/@akh.jewelry",
  footerBlurb:
    "An independent jewelry studio. Sculptural pieces handcrafted in limited quantities, shaped by natural materials, personal symbolism and the character of each stone.",
};

export const getSiteSettings = cache(async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabaseAdmin().from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw new Error(`getSiteSettings: ${error.message}`);
  if (!data) return DEFAULT_SETTINGS;
  return {
    contactEmail: data.contact_email,
    contactPhone: data.contact_phone ?? undefined,
    whatsappNumber: data.whatsapp_number ?? undefined,
    instagramUrl: data.instagram_url ?? undefined,
    tiktokUrl: data.tiktok_url ?? undefined,
    footerBlurb: data.footer_blurb,
  };
});

/** Admin only — call `requireAdminAction()` before this. */
export async function updateSiteSettings(settings: SiteSettings): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("site_settings")
    .update({
      contact_email: settings.contactEmail,
      contact_phone: settings.contactPhone || null,
      whatsapp_number: settings.whatsappNumber || null,
      instagram_url: settings.instagramUrl || null,
      tiktok_url: settings.tiktokUrl || null,
      footer_blurb: settings.footerBlurb,
    })
    .eq("id", 1);
  if (error) throw new Error(`updateSiteSettings: ${error.message}`);
}
