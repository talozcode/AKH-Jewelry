"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/admin/auth";
import { updateOrderStatus, type OrderStatus } from "@/lib/db/orders";

export async function updateOrderStatusAction(
  id: string,
  status: OrderStatus
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminAction();
  try {
    await updateOrderStatus(id, status);
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update status" };
  }
}
