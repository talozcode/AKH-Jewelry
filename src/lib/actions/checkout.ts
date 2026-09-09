"use server";

import { headers } from "next/headers";
import { stripeClient } from "../stripe";
import { getProductById } from "../products";
import { wixImg } from "../wixImage";

// Stripe's full documented list of ISO 3166-1 alpha-2 codes accepted by
// shipping_address_collection.allowed_countries (verified live against
// https://docs.stripe.com/api/checkout/sessions/create — no wildcard
// exists, Stripe requires an explicit list). Effectively "ship anywhere
// Stripe supports," matching the site's "we ship worldwide" copy.
const ALLOWED_SHIPPING_COUNTRIES: string[] = [
  "AC", "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AT", "AU", "AW", "AX", "AZ",
  "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS",
  "BT", "BV", "BW", "BY", "BZ", "CA", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN", "CO",
  "CR", "CV", "CW", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "EH", "ER",
  "ES", "ET", "FI", "FJ", "FK", "FO", "FR", "GA", "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL",
  "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HN", "HR", "HT", "HU", "ID",
  "IE", "IL", "IM", "IN", "IO", "IQ", "IS", "IT", "JE", "JM", "JO", "JP", "KE", "KG", "KH", "KI",
  "KM", "KN", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV",
  "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MK", "ML", "MM", "MN", "MO", "MQ", "MR", "MS", "MT",
  "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NC", "NE", "NG", "NI", "NL", "NO", "NP", "NR", "NU",
  "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PY", "QA",
  "RE", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL",
  "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SZ", "TA", "TC", "TD", "TF", "TG", "TH", "TJ",
  "TK", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "US", "UY", "UZ", "VA",
  "VC", "VE", "VG", "VN", "VU", "WF", "WS", "XK", "YE", "YT", "ZA", "ZM", "ZW", "ZZ",
] as const;

/**
 * Public action — called from PurchaseArea.tsx's "Buy Now" button, no
 * admin gate. Builds a hosted Stripe Checkout Session for exactly one
 * product (+ optional size) and returns its URL rather than calling
 * redirect() directly, so the caller (a client component already using
 * the createReservation-style { ok, ... } pattern) can show a real error
 * inline instead of forcing a hard navigation on failure.
 */
export async function createCheckoutSession(
  productId: string,
  size?: string
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const product = await getProductById(productId);
  if (!product || !product.isPublished) {
    return { ok: false, error: "This piece is no longer available." };
  }
  if (product.availability === "Out of Stock") {
    return { ok: false, error: "This piece is out of stock." };
  }

  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  try {
    const stripe = stripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: product.currency.toLowerCase(),
            unit_amount: Math.round(product.price * 100),
            product_data: {
              name: product.name,
              ...(size ? { description: `Size ${size}` } : {}),
              // wixImg() always returns a full public URL (either the
              // Wix CDN or a Supabase Storage URL) — safe to hand to
              // Stripe's checkout page directly, which needs a real
              // publicly reachable image URL, not a bare id.
              ...(product.images[0] ? { images: [wixImg(product.images[0], 900, 1125)] } : {}),
            },
          },
        },
      ],
      shipping_address_collection: { allowed_countries: [...ALLOWED_SHIPPING_COUNTRIES] },
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/product/${product.slug}`,
      metadata: {
        productId: product.id ?? "",
        slug: product.slug,
        size: size ?? "",
      },
    });

    if (!session.url) return { ok: false, error: "Could not start checkout. Please try again." };
    return { ok: true, url: session.url };
  } catch (err) {
    console.error("createCheckoutSession failed:", err);
    return { ok: false, error: "Could not start checkout. Please try again." };
  }
}
