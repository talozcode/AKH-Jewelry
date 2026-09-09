"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "../supabase/server";
import type { Product } from "../types";

export type CreateReservationInput = {
  product: Product;
  size?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message?: string;
};

/**
 * Public action — called from PurchaseArea.tsx on the storefront, no admin
 * gate. Snapshots the product's name/slug/price/currency at submission time
 * (plus a nullable FK) so the reservation stays meaningful even if the
 * product is later edited or deleted from /admin.
 */
export async function createReservation(
  input: CreateReservationInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const name = input.customerName.trim();
  const email = input.customerEmail.trim();
  const phone = input.customerPhone.trim();

  if (!name) return { ok: false, error: "Name is required." };
  if (!email || !email.includes("@")) return { ok: false, error: "A valid email is required." };
  if (!phone) return { ok: false, error: "Phone is required." };

  const { error } = await supabaseAdmin().from("reservations").insert({
    product_id: input.product.id ?? null,
    product_name: input.product.name,
    product_slug: input.product.slug,
    product_price: input.product.price,
    product_currency: input.product.currency,
    size: input.size || null,
    customer_name: name,
    customer_email: email,
    customer_phone: phone,
    message: input.message?.trim() || null,
  });

  if (error) return { ok: false, error: "Something went wrong. Please try again or email us directly." };

  revalidatePath("/admin/reservations");
  revalidatePath("/admin");
  return { ok: true };
}
