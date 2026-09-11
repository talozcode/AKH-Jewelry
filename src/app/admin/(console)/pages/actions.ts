"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/admin/auth";
import { updatePage, type PageContent, type PageKey } from "@/lib/pages";

const REVALIDATE_PATHS: Record<PageKey, string[]> = {
  home: ["/"],
  story: ["/story"],
  bespoke: ["/bespoke"],
  faq: ["/faq"],
  "shipping-returns": ["/shipping-returns"],
  care: ["/care"],
  "size-guide": ["/size-guide"],
  contact: ["/contact"],
  terms: ["/terms"],
  privacy: ["/privacy"],
};

export async function updatePageAction<K extends PageKey>(
  key: K,
  content: PageContent<K>
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminAction();
  try {
    await updatePage(key, content);
    for (const path of REVALIDATE_PATHS[key]) revalidatePath(path);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to save" };
  }
}
