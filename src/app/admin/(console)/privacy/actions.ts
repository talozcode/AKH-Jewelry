"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/admin/auth";
import { friendlyDbError } from "@/lib/admin/friendlyError";
import { anonymizeOrdersByEmail, exportPersonalData, findPersonalDataByEmail, type PersonalDataSummary } from "@/lib/db/privacy";

export async function lookupPersonalDataAction(
  email: string
): Promise<{ ok: true; summary: PersonalDataSummary } | { ok: false; error: string }> {
  await requireAdminAction();
  const trimmed = email.trim();
  if (!trimmed) return { ok: false, error: "Enter an email address" };
  try {
    const summary = await findPersonalDataByEmail(trimmed);
    return { ok: true, summary };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? friendlyDbError(err.message) : "Lookup failed" };
  }
}

export async function exportPersonalDataAction(email: string): Promise<{ ok: true; json: string } | { ok: false; error: string }> {
  await requireAdminAction();
  try {
    const data = await exportPersonalData(email.trim());
    return { ok: true, json: JSON.stringify(data, null, 2) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? friendlyDbError(err.message) : "Export failed" };
  }
}

/**
 * `confirmEmail` is the owner's retyped email from the UI's typed-
 * confirmation input. Checked again here, not just enforced by disabling
 * the button client-side, since this action is irreversible and mutates a
 * financial record: a disabled button is a UI nicety, not a server-side
 * guarantee.
 */
export async function erasePersonalDataAction(
  email: string,
  confirmEmail: string
): Promise<{ ok: true; erasedCount: number } | { ok: false; error: string }> {
  await requireAdminAction();
  const trimmed = email.trim();
  if (!trimmed || trimmed.toLowerCase() !== confirmEmail.trim().toLowerCase()) {
    return { ok: false, error: "Typed confirmation doesn't match the email address" };
  }
  try {
    const result = await anonymizeOrdersByEmail(trimmed);
    revalidatePath("/admin/privacy");
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { ok: true, erasedCount: result.erasedCount };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? friendlyDbError(err.message) : "Erasure failed" };
  }
}
