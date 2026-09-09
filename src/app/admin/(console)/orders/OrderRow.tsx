"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Order, OrderStatus } from "@/lib/db/orders";
import { updateOrderStatusAction } from "./actions";

const STATUSES: OrderStatus[] = ["unfulfilled", "shipped"];

export function OrderRow({ order }: { order: Order }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleStatusChange(status: OrderStatus) {
    startTransition(async () => {
      const result = await updateOrderStatusAction(order.id, status);
      if (result.ok) router.refresh();
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
        </div>
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
        <select
          value={order.status}
          disabled={pending}
          onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
          className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 disabled:opacity-50"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </td>
    </tr>
  );
}
