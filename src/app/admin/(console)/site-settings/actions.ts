"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/admin/auth";
import { friendlyDbError } from "@/lib/admin/friendlyError";
import { updateSiteSettings, type SiteSettings } from "@/lib/site-settings";

export async function updateSiteSettingsAction(settings: SiteSettings): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminAction();
  try {
    await updateSiteSettings(settings);
    // Header/Footer render on every (site) page via the shared layout.
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? friendlyDbError(err.message) : "Failed to save" };
  }
}
