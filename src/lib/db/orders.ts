import { supabaseAdmin } from "../supabase/server";
import type { Database } from "../supabase/database.types";

export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderStatus = Order["status"];

export async function getOrders(filters?: { status?: OrderStatus }): Promise<Order[]> {
  let query = supabaseAdmin().from("orders").select("*").order("created_at", { ascending: false });
  if (filters?.status) query = query.eq("status", filters.status);
  const { data, error } = await query;
  if (error) throw new Error(`getOrders: ${error.message}`);
  return data ?? [];
}

export async function getOrderCountsByStatus(): Promise<Record<OrderStatus, number>> {
  const { data, error } = await supabaseAdmin().from("orders").select("status");
  if (error) throw new Error(`getOrderCountsByStatus: ${error.message}`);
  const counts: Record<OrderStatus, number> = { unfulfilled: 0, shipped: 0 };
  for (const row of data ?? []) counts[row.status]++;
  return counts;
}

/**
 * Sum of amount_total (Stripe's smallest-currency-unit amounts), grouped
 * by currency — never summed across currencies, since ₪ and $ aren't the
 * same unit. Most orders are expected to be ILS; a second currency just
 * shows as its own line rather than silently distorting one total.
 */
export async function getRevenueByCurrency(): Promise<Record<string, number>> {
  const { data, error } = await supabaseAdmin().from("orders").select("amount_total, currency");
  if (error) throw new Error(`getRevenueByCurrency: ${error.message}`);
  const totals: Record<string, number> = {};
  for (const row of data ?? []) totals[row.currency] = (totals[row.currency] ?? 0) + row.amount_total;
  return totals;
}

/** Admin only — call `requireAdminAction()` before this. */
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const { error } = await supabaseAdmin().from("orders").update({ status }).eq("id", id);
  if (error) throw new Error(`updateOrderStatus: ${error.message}`);
}
