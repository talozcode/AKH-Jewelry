"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/admin/auth";
import { friendlyDbError } from "@/lib/admin/friendlyError";
import {
  canRefund,
  getOrderById,
  getOrders,
  ordersToCsv,
  refundOrder,
  setOrderTracking,
  updateOrderStatus,
  type OrderStatus,
  type SettableOrderStatus,
} from "@/lib/db/orders";
import { stripeClient } from "@/lib/stripe";
import { sendEmail } from "@/lib/email/send";
import { orderShippedEmail, refundConfirmationEmail } from "@/lib/email/templates";

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
    if (status === "shipped") {
      const order = await getOrderById(id);
      if (order?.customer_email) {
        await sendEmail({
          to: order.customer_email,
          ...orderShippedEmail({
            customerName: order.customer_name,
            items: order.items.map((item) => ({ name: item.product_name, size: item.size, quantity: item.quantity })),
            trackingNumber: order.tracking_number,
            carrier: order.carrier,
          }),
        });
      }
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? friendlyDbError(err.message) : "Failed to update status" };
  }
}

export async function updateTrackingAction(
  id: string,
  trackingNumber: string | null,
  carrier: string | null
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminAction();
  try {
    await setOrderTracking(id, { trackingNumber, carrier });
    revalidatePath("/admin/orders");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? friendlyDbError(err.message) : "Failed to save tracking" };
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
    const didWrite = await refundOrder(order.id, { stripeRefundId: refund.id, amountRefunded: refund.amount });
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    // didWrite is false only if the webhook's own refund.* handler won
    // the race and already recorded this exact refund (see refundOrder's
    // doc comment) - it already sent its own confirmation email, so this
    // skips sending a second one for the same refund.
    if (didWrite && order.customer_email) {
      await sendEmail({
        to: order.customer_email,
        ...refundConfirmationEmail({ customerName: order.customer_name, amountRefunded: refund.amount, currency: order.currency }),
      });
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? friendlyDbError(err.message) : "Refund failed" };
  }
}

/**
 * For the owner's own bookkeeping/accountant/tax filing - previously the
 * only export in the admin was the GDPR data-subject export, scoped to
 * one customer's email at a time. Respects whatever status filter is
 * currently applied on the page, so "Export CSV" while viewing e.g.
 * Refunded exports just that filtered set, matching what she's looking at.
 */
export async function exportOrdersCsvAction(status?: OrderStatus): Promise<{ ok: true; csv: string } | { ok: false; error: string }> {
  await requireAdminAction();
  try {
    const orders = await getOrders(status ? { status } : undefined);
    return { ok: true, csv: ordersToCsv(orders) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? friendlyDbError(err.message) : "Export failed" };
  }
}
