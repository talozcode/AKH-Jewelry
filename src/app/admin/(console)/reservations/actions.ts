"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/admin/auth";
import { updateReservationStatus, type ReservationStatus } from "@/lib/db/reservations";

export async function updateReservationStatusAction(
  id: string,
  status: ReservationStatus
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminAction();
  try {
    await updateReservationStatus(id, status);
    revalidatePath("/admin/reservations");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update status" };
  }
}
