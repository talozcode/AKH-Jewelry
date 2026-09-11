"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Order, SettableOrderStatus } from "@/lib/db/orders";
import { refundOrderAction, updateOrderStatusAction } from "./actions";

const STATUSES: SettableOrderStatus[] = ["unfulfilled", "shipped"];

export function OrderRow({ order, productOutOfStock }: { order: Order; productOutOfStock: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [refunding, startRefund] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleStatusChange(status: SettableOrderStatus) {
    startTransition(async () => {
      const result = await updateOrderStatusAction(order.id, status);
      if (result.ok) router.refresh();
    });
  }

  function handleRefund() {
    if (!confirm(`Refund ${order.product_name} (${(order.amount_total / 100).toLocaleString()} ${order.currency})? This can't be undone.`)) return;
    setError(null);
    startRefund(async () => {
      const result = await refundOrderAction(order.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <tr className="border-b border-slate-100 align-top last:border-0 hover:bg-slate-50/60">
      <td className="py-3 pl-5 pr-3 text-slate-500">{new Date(order.created_at).toLocaleDateString("en-GB")}</td>
      <td className="py-3 pr-3">
        <div className="font-medium text-slate-900">{order.product_name}</div>
        {order.size ? <div className="text-xs text-slate-500">Size {order.size}</div> : null}
        <div className="text-xs text-slate-500">
          {order.currency === "ILS" ? "₪" : order.currency === "USD" ? "$" : order.currency + " "}
          {(order.amount_total / 100).toLocaleString()}
          {order.amount_refunded > 0 ? <span className="text-red-600"> (refunded)</span> : null}
        </div>
        {order.oversold ? (
          <span className="mt-1 inline-block rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">
            Oversold: tracked stock hit 0 after this paid
          </span>
        ) : null}
      </td>
      <td className="py-3 pr-3">
        <div className="text-slate-900">{order.customer_name}</div>
        <div className="text-xs text-slate-500">{order.customer_email}</div>
      </td>
      <td className="py-3 pr-3 text-xs text-slate-500">
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
            <span className="inline-block rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">Refunded</span>
            {order.refunded_at ? <div className="mt-1 text-xs text-slate-400">{new Date(order.refunded_at).toLocaleDateString("en-GB")}</div> : null}
            {productOutOfStock ? (
              <a href={`/admin/products/${order.product_id}`} className="mt-2 block text-xs text-copper underline underline-offset-2">
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
              className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 disabled:opacity-50"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleRefund}
              disabled={refunding}
              className="block text-xs text-red-600 underline underline-offset-2 hover:text-red-700 disabled:opacity-50"
            >
              {refunding ? "Refunding…" : "Refund"}
            </button>
            {error ? <p className="text-xs text-red-600">{error}</p> : null}
          </div>
        )}
      </td>
    </tr>
  );
}
