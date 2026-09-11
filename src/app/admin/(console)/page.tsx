import Link from "next/link";
import { getDashboardMetrics } from "@/lib/admin/metrics";

export const dynamic = "force-dynamic";

function Card({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent: string }) {
  return (
    <div
      className="overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)]"
      style={{ boxShadow: "var(--admin-shadow)" }}
    >
      <div className="h-1" style={{ backgroundColor: accent }} />
      <div className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">{label}</p>
        <p className="mt-2 text-3xl font-semibold text-[var(--admin-text)]">{value}</p>
        {sub ? <p className="mt-1 text-xs text-[var(--admin-text-faint)]">{sub}</p> : null}
      </div>
    </div>
  );
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)]" style={{ boxShadow: "var(--admin-shadow)" }}>
      <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-5 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <li className="flex items-center justify-between border-b border-[var(--admin-border)] py-2 text-sm last:border-0">
      <span className="text-[var(--admin-text)]/80">{label}</span>
      <span className="font-medium text-[var(--admin-text)]">{value}</span>
    </li>
  );
}

function currencySymbol(currency: string) {
  return currency === "ILS" ? "₪" : currency === "USD" ? "$" : currency + " ";
}

export default async function AdminDashboardPage() {
  const { products, orderStatusCounts, revenueByCurrency, recentOrders } = await getDashboardMetrics();
  const revenueEntries = Object.entries(revenueByCurrency);
  const primaryRevenue = revenueEntries.sort((a, b) => b[1] - a[1])[0];

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--admin-text)]">Dashboard</h1>
      <p className="mt-1 text-sm text-[var(--admin-text-muted)]">An overview of the shop right now.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <Card
          label="Revenue"
          value={primaryRevenue ? `${currencySymbol(primaryRevenue[0])}${(primaryRevenue[1] / 100).toLocaleString()}` : "None yet"}
          sub={
            revenueEntries.length > 1
              ? revenueEntries
                  .slice(1)
                  .map(([c, v]) => `+ ${currencySymbol(c)}${(v / 100).toLocaleString()}`)
                  .join(", ")
              : "net of refunds, all-time"
          }
          accent="var(--admin-success)"
        />
        <Card label="Unfulfilled orders" value={orderStatusCounts.unfulfilled} sub="need shipping" accent="var(--admin-warning)" />
        <Card label="Products" value={products.total} sub={`${products.published} published, ${products.draft} draft`} accent="var(--admin-brass)" />
        <Card label="Shipped orders" value={orderStatusCounts.shipped} accent="var(--admin-accent-soft)" />
        <Card label="Refunded orders" value={orderStatusCounts.refunded} accent="var(--admin-danger)" />
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="space-y-6">
          <Panel
            title="Recent orders"
            action={
              <Link href="/admin/orders" className="text-xs font-medium text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]">
                View all &rarr;
              </Link>
            }
          >
            {recentOrders.length === 0 ? (
              <p className="text-sm text-[var(--admin-text-faint)]">No orders yet.</p>
            ) : (
              <ul>
                {recentOrders.map((o) => (
                  <li key={o.id} className="flex items-center justify-between border-b border-[var(--admin-border)] py-2 text-sm last:border-0">
                    <span className="text-[var(--admin-text)]/80">
                      {o.customer_name}, {o.product_name}
                    </span>
                    <span className="rounded-full bg-[var(--admin-surface-2)] px-2 py-0.5 text-xs font-medium text-[var(--admin-text-muted)]">
                      {o.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Products by category">
            <ul>
              {Object.entries(products.byCategory).map(([category, count]) => (
                <Row key={category} label={category} value={count} />
              ))}
            </ul>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Products by availability">
            <ul>
              {Object.entries(products.byAvailability).map(([availability, count]) => (
                <Row key={availability} label={availability} value={count} />
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
