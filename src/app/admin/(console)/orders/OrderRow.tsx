"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Order, SettableOrderStatus } from "@/lib/db/orders";
import { ConfirmDialog } from "../_components/ConfirmDialog";
import { refundOrderAction, updateOrderStatusAction } from "./actions";

const STATUSES: SettableOrderStatus[] = ["unfulfilled", "shipped"];

export function OrderRow({ order, productOutOfStock }: { order: Order; productOutOfStock: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [refunding, startRefund] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmingRefund, setConfirmingRefund] = useState(false);

  function handleStatusChange(status: SettableOrderStatus) {
    startTransition(async () => {
      const result = await updateOrderStatusAction(order.id, status);
      if (result.ok) router.refresh();
    });
  }

  function handleRefund() {
    setError(null);
    startRefund(async () => {
      const result = await refundOrderAction(order.id);
      // Close the dialog either way: on failure so the error shows on the
      // row itself instead of behind a stale confirmation; on success
      // because this row survives router.refresh() (it's keyed by
      // order.id, not unmounted), so nothing else would ever close it and
      // the "Refund this order?" dialog would sit on top of the row after
      // it had already flipped to Refunded underneath.
      setConfirmingRefund(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  const amountLabel = `${order.currency === "ILS" ? "₪" : order.currency === "USD" ? "$" : order.currency + " "}${(order.amount_total / 100).toLocaleString()}`;

  return (
    <tr className="border-b border-[var(--admin-border)] align-top last:border-0 hover:bg-[var(--admin-surface-2)]/60">
      <td className="py-3 pl-5 pr-3 text-[var(--admin-text-muted)]">{new Date(order.created_at).toLocaleDateString("en-GB")}</td>
      <td className="py-3 pr-3">
        <div className="font-medium text-[var(--admin-text)]">{order.product_name}</div>
        {order.size ? <div className="text-xs text-[var(--admin-text-muted)]">Size {order.size}</div> : null}
        <div className="text-xs text-[var(--admin-text-muted)]">
          {order.currency === "ILS" ? "₪" : order.currency === "USD" ? "$" : order.currency + " "}
          {(order.amount_total / 100).toLocaleString()}
          {order.amount_refunded > 0 ? <span className="text-[var(--admin-danger)]"> (refunded)</span> : null}
        </div>
        {order.oversold ? (
          <span className="mt-1 inline-block rounded-full bg-[var(--admin-danger-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--admin-danger)]">
            Oversold: tracked stock hit 0 after this paid
          </span>
        ) : null}
      </td>
      <td className="py-3 pr-3">
        <div className="text-[var(--admin-text)]">{order.customer_name}</div>
        <div className="text-xs text-[var(--admin-text-muted)]">{order.customer_email}</div>
      </td>
      <td className="py-3 pr-3 text-xs text-[var(--admin-text-muted)]">
        <div>{order.shipping_line1}</div>
        {order.shipping_line2 ? <div>{order.shipping_line2}</div> : null}
        <div>
          {order.shipping_city}
          {order.shipping_state ? `, ${order.shipping_state}` : ""} {order.shipping_postal_code}
        </div>
        <div>{order.shipping_country}</div>
      </td>
      <td className="py-3 pr-5">
        {order.status === "refunded" ? (
          <div>
            <span className="inline-block rounded-full bg-[var(--admin-danger-bg)] px-2.5 py-1 text-xs font-medium text-[var(--admin-danger)]">Refunded</span>
            {order.refunded_at ? <div className="mt-1 text-xs text-[var(--admin-text-faint)]">{new Date(order.refunded_at).toLocaleDateString("en-GB")}</div> : null}
            {productOutOfStock ? (
              <a href={`/admin/products/${order.product_id}`} className="mt-2 block text-xs text-[var(--admin-accent-soft)] underline underline-offset-2">
                This piece is marked Out of Stock. Relist it?
              </a>
            ) : null}
          </div>
        ) : (
          <div className="space-y-2">
            <select
              value={order.status}
              disabled={pending}
              onChange={(e) => handleStatusChange(e.target.value as SettableOrderStatus)}
              className="rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] px-2 py-1.5 text-sm outline-none focus:border-[var(--admin-accent-soft)] focus:ring-1 focus:ring-[var(--admin-accent-soft)] disabled:opacity-50"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setConfirmingRefund(true)}
              disabled={refunding}
              className="block text-xs text-[var(--admin-danger)] underline underline-offset-2 hover:opacity-75 disabled:opacity-50"
            >
              {refunding ? "Refunding…" : "Refund"}
            </button>
            {error ? <p className="text-xs text-[var(--admin-danger)]">{error}</p> : null}
          </div>
        )}
      </td>

      <ConfirmDialog
        open={confirmingRefund}
        title="Refund this order?"
        description={`Refunds ${amountLabel} to the customer through Stripe. This can't be undone.`}
        confirmLabel="Refund order"
        pending={refunding}
        onConfirm={handleRefund}
        onCancel={() => setConfirmingRefund(false)}
      />
    </tr>
  );
}
