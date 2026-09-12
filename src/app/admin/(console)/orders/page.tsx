import type { Metadata } from "next";
import { getOrders, type OrderStatus } from "@/lib/db/orders";
import { getProductById } from "@/lib/products";
import { ExportOrdersButton } from "./ExportOrdersButton";
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

  // Only refunded orders need the "relist?" prompt, so only those trigger
  // product lookups (see OrderRow: inventory never auto-relists on
  // refund). A multi-item order can have several out-of-stock items, so
  // this is a set of product ids rather than one boolean per order.
  const outOfStockProductIds = new Set<string>();
  const checkedProductIds = new Set<string>();
  for (const order of orders) {
    if (order.status !== "refunded") continue;
    for (const item of order.items) {
      if (!item.product_id || checkedProductIds.has(item.product_id)) continue;
      checkedProductIds.add(item.product_id);
      const product = await getProductById(item.product_id);
      if (product?.availability === "Out of Stock") outOfStockProductIds.add(item.product_id);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--admin-text)]">Orders</h1>
      <p className="mt-1 text-sm text-[var(--admin-text-muted)]">Real, paid Stripe orders. Mark a piece shipped once it&apos;s dispatched.</p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 text-sm">
          {STATUS_FILTERS.map((f) => (
            <a
              key={f.label}
              href={f.value ? `/admin/orders?status=${f.value}` : "/admin/orders"}
              className={`rounded-md px-3 py-1.5 font-medium ${
                validStatus === f.value ? "bg-[var(--admin-accent)] text-[var(--admin-accent-text)]" : "border border-[var(--admin-border-strong)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface-2)]"
              }`}
            >
              {f.label}
            </a>
          ))}
        </div>
        <ExportOrdersButton status={validStatus} />
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-surface-2)] text-left text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
                <th className="py-3 pl-5 pr-3">Date</th>
                <th className="py-3 pr-3">Piece</th>
                <th className="py-3 pr-3">Customer</th>
                <th className="py-3 pr-3">Shipping</th>
                <th className="py-3 pr-5">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <OrderRow key={o.id} order={o} outOfStockProductIds={outOfStockProductIds} />
              ))}
            </tbody>
          </table>
          {orders.length === 0 ? <p className="py-8 text-center text-[var(--admin-text-faint)]">No orders yet.</p> : null}
        </div>
      </div>
    </div>
  );
}
