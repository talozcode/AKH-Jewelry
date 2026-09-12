"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/admin/auth";
import { friendlyDbError } from "@/lib/admin/friendlyError";
import { canRefund, getOrderById, refundOrder, updateOrderStatus, type SettableOrderStatus } from "@/lib/db/orders";
import { stripeClient } from "@/lib/stripe";

const SETTABLE_STATUSES: SettableOrderStatus[] = ["unfulfilled", "shipped"];

export async function updateOrderStatusAction(
  id: string,
  status: SettableOrderStatus
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminAction();
  // Runtime half of the guard: SettableOrderStatus already excludes
  // "refunded" at the type level, but this action is the actual attack
  // surface (a request can be replayed/edited independently of the
  // dropdown's options), so it's re-checked here rather than trusted.
  if (!SETTABLE_STATUSES.includes(status)) {
    return { ok: false, error: "Use the refund action to mark an order refunded." };
  }
  try {
    await updateOrderStatus(id, status);
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? friendlyDbError(err.message) : "Failed to update status" };
  }
}

/**
 * Full refunds only in v1. Calls Stripe first, writes the DB second: if
 * Stripe succeeds and the DB write then fails, the money left and the row
 * is stale, which is visible (the dashboard/Stripe disagree) and
 * recoverable by re-running this or via the webhook. The reverse order
 * would show a refund that never happened and produce a chargeback.
 *
 * Three layers of double-refund protection: the UI hides the refund button
 * once `order.status === "refunded"`; `canRefund` re-reads the order
 * server-side here (the UI check goes stale across two open tabs); and the
 * idempotency key is scoped to this order and its exact charged amount, so
 * two concurrent clicks can't both succeed at Stripe.
 */
export async function refundOrderAction(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminAction();

  const order = await getOrderById(id);
  if (!order) return { ok: false, error: "Order not found" };

  const guard = canRefund(order);
  if (!guard.ok) return { ok: false, error: guard.reason };

  try {
    const stripe = await stripeClient();
    const refund = await stripe.refunds.create(
      { payment_intent: order.stripe_payment_intent_id! },
      { idempotencyKey: `refund-${order.id}-${order.amount_total}` }
    );
    await refundOrder(order.id, { stripeRefundId: refund.id, amountRefunded: refund.amount });
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? friendlyDbError(err.message) : "Refund failed" };
  }
}
