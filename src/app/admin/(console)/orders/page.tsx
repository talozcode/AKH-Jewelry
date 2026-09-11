import type { Metadata } from "next";
import { getOrders, type OrderStatus } from "@/lib/db/orders";
import { getProductById } from "@/lib/products";
import { OrderRow } from "./OrderRow";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Orders" };

const STATUS_FILTERS: { label: string; value: OrderStatus | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Unfulfilled", value: "unfulfilled" },
  { label: "Shipped", value: "shipped" },
  { label: "Refunded", value: "refunded" },
];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const validStatus = STATUS_FILTERS.find((f) => f.value === status)?.value;
  const orders = await getOrders(validStatus ? { status: validStatus } : undefined);

  // Only refunded orders need the "relist?" prompt, so only those trigger a
  // product lookup (see OrderRow: inventory never auto-relists on refund).
  const outOfStockByOrderId = new Map<string, boolean>();
  for (const order of orders) {
    if (order.status === "refunded" && order.product_id) {
      const product = await getProductById(order.product_id);
      outOfStockByOrderId.set(order.id, product?.availability === "Out of Stock");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Orders</h1>
      <p className="mt-1 text-sm text-slate-500">Real, paid Stripe orders. Mark a piece shipped once it&apos;s dispatched.</p>

      <div className="mt-6 flex gap-2 text-sm">
        {STATUS_FILTERS.map((f) => (
          <a
            key={f.label}
            href={f.value ? `/admin/orders?status=${f.value}` : "/admin/orders"}
            className={`rounded-md px-3 py-1.5 font-medium ${
              validStatus === f.value ? "bg-slate-900 text-white" : "border border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="py-3 pl-5 pr-3">Date</th>
                <th className="py-3 pr-3">Piece</th>
                <th className="py-3 pr-3">Customer</th>
                <th className="py-3 pr-3">Shipping</th>
                <th className="py-3 pr-5">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <OrderRow key={o.id} order={o} productOutOfStock={outOfStockByOrderId.get(o.id) ?? false} />
              ))}
            </tbody>
          </table>
          {orders.length === 0 ? <p className="py-8 text-center text-slate-400">No orders yet.</p> : null}
        </div>
      </div>
    </div>
  );
}
