import Link from "next/link";
import { getDashboardMetrics } from "@/lib/admin/metrics";

export const dynamic = "force-dynamic";

function Card({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="border border-ink/10 p-5">
      <p className="text-xs uppercase tracking-[0.08em] text-ink/50">{label}</p>
      <p className="mt-2 text-3xl font-medium">{value}</p>
      {sub ? <p className="mt-1 text-xs text-ink/50">{sub}</p> : null}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const { products, reservationStatusCounts, mostReserved, recentReservations } = await getDashboardMetrics();
  const newReservations = reservationStatusCounts.new;

  return (
    <div>
      <h1 className="text-2xl font-medium">Dashboard</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card label="Products" value={products.total} sub={`${products.published} published, ${products.draft} draft`} />
        <Card label="New reservations" value={newReservations} sub="need a response" />
        <Card label="Contacted" value={reservationStatusCounts.contacted} />
        <Card label="Fulfilled" value={reservationStatusCounts.fulfilled} />
      </div>

      <div className="mt-10 grid gap-10 sm:grid-cols-2">
        <div>
          <h2 className="text-sm uppercase tracking-[0.08em] text-ink/50">Products by category</h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {Object.entries(products.byCategory).map(([category, count]) => (
              <li key={category} className="flex justify-between border-b border-ink/5 py-1.5">
                <span>{category}</span>
                <span className="text-ink/60">{count}</span>
              </li>
            ))}
          </ul>

          <h2 className="mt-8 text-sm uppercase tracking-[0.08em] text-ink/50">Products by availability</h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {Object.entries(products.byAvailability).map(([availability, count]) => (
              <li key={availability} className="flex justify-between border-b border-ink/5 py-1.5">
                <span>{availability}</span>
                <span className="text-ink/60">{count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm uppercase tracking-[0.08em] text-ink/50">Most-reserved pieces</h2>
          {mostReserved.length === 0 ? (
            <p className="mt-3 text-sm text-ink/50">No reservations yet.</p>
          ) : (
            <ul className="mt-3 space-y-1.5 text-sm">
              {mostReserved.map((p) => (
                <li key={p.slug} className="flex justify-between border-b border-ink/5 py-1.5">
                  <span>{p.name}</span>
                  <span className="text-ink/60">{p.count}</span>
                </li>
              ))}
            </ul>
          )}

          <h2 className="mt-8 text-sm uppercase tracking-[0.08em] text-ink/50">Recent reservations</h2>
          {recentReservations.length === 0 ? (
            <p className="mt-3 text-sm text-ink/50">No reservations yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {recentReservations.map((r) => (
                <li key={r.id} className="border-b border-ink/5 py-1.5">
                  <div className="flex justify-between">
                    <span>
                      {r.customer_name} — {r.product_name}
                    </span>
                    <span className="text-xs text-ink/50">{r.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/reservations" className="mt-4 inline-block text-sm text-ink underline underline-offset-2 hover:text-copper">
            View all reservations →
          </Link>
        </div>
      </div>
    </div>
  );
}
