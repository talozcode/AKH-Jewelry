"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Reservation, ReservationStatus } from "@/lib/db/reservations";
import { updateReservationStatusAction } from "./actions";

const STATUSES: ReservationStatus[] = ["new", "contacted", "fulfilled", "cancelled"];

export function ReservationRow({ reservation }: { reservation: Reservation }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleStatusChange(status: ReservationStatus) {
    startTransition(async () => {
      const result = await updateReservationStatusAction(reservation.id, status);
      if (result.ok) router.refresh();
    });
  }

  return (
    <tr className="border-b border-slate-100 align-top last:border-0 hover:bg-slate-50/60">
      <td className="py-3 pl-5 pr-3 text-slate-500">{new Date(reservation.created_at).toLocaleDateString("en-GB")}</td>
      <td className="py-3 pr-3">
        <div className="font-medium text-slate-900">{reservation.product_name}</div>
        {reservation.size ? <div className="text-xs text-slate-500">Size {reservation.size}</div> : null}
        <div className="text-xs text-slate-500">
          {reservation.product_currency === "ILS" ? "₪" : "$"}
          {reservation.product_price.toLocaleString()}
        </div>
      </td>
      <td className="py-3 pr-3">
        <div className="text-slate-900">{reservation.customer_name}</div>
        <div className="text-xs text-slate-500">{reservation.customer_email}</div>
        <div className="text-xs text-slate-500">{reservation.customer_phone}</div>
        {reservation.message ? <div className="mt-1 max-w-xs text-xs text-slate-500">&ldquo;{reservation.message}&rdquo;</div> : null}
      </td>
      <td className="py-3 pr-5">
        <select
          value={reservation.status}
          disabled={pending}
          onChange={(e) => handleStatusChange(e.target.value as ReservationStatus)}
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
