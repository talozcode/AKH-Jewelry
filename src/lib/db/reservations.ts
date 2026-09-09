import { supabaseAdmin } from "../supabase/server";
import type { Database } from "../supabase/database.types";

export type Reservation = Database["public"]["Tables"]["reservations"]["Row"];
export type ReservationStatus = Reservation["status"];

export async function getReservations(filters?: { status?: ReservationStatus }): Promise<Reservation[]> {
  let query = supabaseAdmin().from("reservations").select("*").order("created_at", { ascending: false });
  if (filters?.status) query = query.eq("status", filters.status);
  const { data, error } = await query;
  if (error) throw new Error(`getReservations: ${error.message}`);
  return data ?? [];
}

export async function getReservationCountsByStatus(): Promise<Record<ReservationStatus, number>> {
  const { data, error } = await supabaseAdmin().from("reservations").select("status");
  if (error) throw new Error(`getReservationCountsByStatus: ${error.message}`);
  const counts: Record<ReservationStatus, number> = { new: 0, contacted: 0, fulfilled: 0, cancelled: 0 };
  for (const row of data ?? []) counts[row.status]++;
  return counts;
}

export async function getMostReservedProducts(limit = 5): Promise<{ slug: string; name: string; count: number }[]> {
  const { data, error } = await supabaseAdmin().from("reservations").select("product_slug, product_name");
  if (error) throw new Error(`getMostReservedProducts: ${error.message}`);
  const counts = new Map<string, { name: string; count: number }>();
  for (const row of data ?? []) {
    const existing = counts.get(row.product_slug);
    if (existing) existing.count++;
    else counts.set(row.product_slug, { name: row.product_name, count: 1 });
  }
  return Array.from(counts.entries())
    .map(([slug, v]) => ({ slug, name: v.name, count: v.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Admin only — call `requireAdminAction()` before this. */
export async function updateReservationStatus(id: string, status: ReservationStatus, adminNotes?: string) {
  const { error } = await supabaseAdmin()
    .from("reservations")
    .update({ status, ...(adminNotes !== undefined ? { admin_notes: adminNotes } : {}) })
    .eq("id", id);
  if (error) throw new Error(`updateReservationStatus: ${error.message}`);
}
