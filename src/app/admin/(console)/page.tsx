import Link from "next/link";
import { getDashboardMetrics } from "@/lib/admin/metrics";

export const dynamic = "force-dynamic";

function Card({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className={`h-1 ${accent ?? "bg-slate-900"}`} />
      <div className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
        {sub ? <p className="mt-1 text-xs text-slate-400">{sub}</p> : null}
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <li className="flex items-center justify-between border-b border-slate-100 py-2 text-sm last:border-0">
      <span className="text-slate-700">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </li>
  );
}

export default async function AdminDashboardPage() {
  const { products, reservationStatusCounts, mostReserved, recentReservations } = await getDashboardMetrics();
  const newReservations = reservationStatusCounts.new;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">An overview of the shop right now.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card label="Products" value={products.total} sub={`${products.published} published, ${products.draft} draft`} accent="bg-slate-900" />
        <Card label="New reservations" value={newReservations} sub="need a response" accent="bg-amber-500" />
        <Card label="Contacted" value={reservationStatusCounts.contacted} accent="bg-sky-500" />
        <Card label="Fulfilled" value={reservationStatusCounts.fulfilled} accent="bg-emerald-500" />
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="space-y-6">
          <Panel title="Products by category">
            <ul>
              {Object.entries(products.byCategory).map(([category, count]) => (
                <Row key={category} label={category} value={count} />
              ))}
            </ul>
          </Panel>

          <Panel title="Products by availability">
            <ul>
              {Object.entries(products.byAvailability).map(([availability, count]) => (
                <Row key={availability} label={availability} value={count} />
              ))}
            </ul>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Most-reserved pieces">
            {mostReserved.length === 0 ? (
              <p className="text-sm text-slate-400">No reservations yet.</p>
            ) : (
              <ul>
                {mostReserved.map((p) => (
                  <Row key={p.slug} label={p.name} value={p.count} />
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Recent reservations">
            {recentReservations.length === 0 ? (
              <p className="text-sm text-slate-400">No reservations yet.</p>
            ) : (
              <ul>
                {recentReservations.map((r) => (
                  <li key={r.id} className="flex items-center justify-between border-b border-slate-100 py-2 text-sm last:border-0">
                    <span className="text-slate-700">
                      {r.customer_name} — {r.product_name}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{r.status}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/admin/reservations" className="mt-4 inline-block text-sm font-medium text-slate-900 hover:underline">
              View all reservations →
            </Link>
          </Panel>
        </div>
      </div>
    </div>
  );
}
