import { supabaseAdmin } from "../supabase/server";
import { getMostReservedProducts, getReservationCountsByStatus } from "../db/reservations";
import { getOrderCountsByStatus, getOrders, getRevenueByCurrency } from "../db/orders";

export async function getProductCounts() {
  const { data, error } = await supabaseAdmin().from("products").select("category, availability, is_published");
  if (error) throw new Error(`getProductCounts: ${error.message}`);
  const rows = data ?? [];

  const byCategory: Record<string, number> = {};
  const byAvailability: Record<string, number> = {};
  let published = 0;
  let draft = 0;

  for (const row of rows) {
    byCategory[row.category] = (byCategory[row.category] ?? 0) + 1;
    byAvailability[row.availability] = (byAvailability[row.availability] ?? 0) + 1;
    if (row.is_published) published++;
    else draft++;
  }

  return { total: rows.length, byCategory, byAvailability, published, draft };
}

export async function getRecentReservations(limit = 5) {
  const { data, error } = await supabaseAdmin()
    .from("reservations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`getRecentReservations: ${error.message}`);
  return data ?? [];
}

export async function getDashboardMetrics() {
  const [products, reservationStatusCounts, mostReserved, recentReservations, orderStatusCounts, revenueByCurrency, recentOrders] =
    await Promise.all([
      getProductCounts(),
      getReservationCountsByStatus(),
      getMostReservedProducts(5),
      getRecentReservations(5),
      getOrderCountsByStatus(),
      getRevenueByCurrency(),
      getOrders().then((orders) => orders.slice(0, 5)),
    ]);
  return { products, reservationStatusCounts, mostReserved, recentReservations, orderStatusCounts, revenueByCurrency, recentOrders };
}
