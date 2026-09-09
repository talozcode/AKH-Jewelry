import { getReservations, type ReservationStatus } from "@/lib/db/reservations";
import { ReservationRow } from "./ReservationRow";

export const dynamic = "force-dynamic";

const STATUS_FILTERS: { label: string; value: ReservationStatus | undefined }[] = [
  { label: "All", value: undefined },
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Fulfilled", value: "fulfilled" },
  { label: "Cancelled", value: "cancelled" },
];

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const validStatus = STATUS_FILTERS.find((f) => f.value === status)?.value;
  const reservations = await getReservations(validStatus ? { status: validStatus } : undefined);

  return (
    <div>
      <h1 className="text-2xl font-medium">Reservations</h1>
      <p className="mt-1 text-sm text-ink/60">
        Requests submitted from the &ldquo;Add to Cart&rdquo; form on the storefront. No payment is
        collected here — confirm and take payment with the customer directly, then mark it fulfilled.
      </p>

      <div className="mt-6 flex gap-2 text-sm">
        {STATUS_FILTERS.map((f) => (
          <a
            key={f.label}
            href={f.value ? `/admin/reservations?status=${f.value}` : "/admin/reservations"}
            className={`border px-3 py-1.5 ${
              validStatus === f.value ? "border-ink bg-charcoal text-ivory" : "border-ink/20 text-ink/60 hover:border-ink"
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-ink/15 text-left text-xs uppercase tracking-[0.06em] text-ink/50">
              <th className="py-2 pr-3">Date</th>
              <th className="py-2 pr-3">Piece</th>
              <th className="py-2 pr-3">Customer</th>
              <th className="py-2 pr-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <ReservationRow key={r.id} reservation={r} />
            ))}
          </tbody>
        </table>
        {reservations.length === 0 ? <p className="py-8 text-center text-ink/50">No reservations yet.</p> : null}
      </div>
    </div>
  );
}
