import { wixImg } from "./wixImage";
import type { Product } from "./types";
import type Stripe from "stripe";

/**
 * Pure logic extracted out of src/lib/actions/checkout.ts, which is a
 * "use server" file: Next.js requires every export of a "use server"
 * module to be an async Server Action, so plain synchronous helpers can't
 * live there even though this is exactly the kind of decision logic worth
 * testing directly (see checkoutParams.test.ts).
 */

export type PurchasabilityCheck = { ok: true } | { ok: false; error: string };

export function checkPurchasable(product: Pick<Product, "isPublished" | "availability"> | undefined): PurchasabilityCheck {
  if (!product || !product.isPublished) return { ok: false, error: "This piece is no longer available." };
  if (product.availability === "Out of Stock") return { ok: false, error: "This piece is out of stock." };
  return { ok: true };
}

// Stripe's full documented list of ISO 3166-1 alpha-2 codes accepted by
// shipping_address_collection.allowed_countries (verified live against
// https://docs.stripe.com/api/checkout/sessions/create: no wildcard
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
 * Builds the params object for stripe.checkout.sessions.create(), pure so
 * the price math is testable without an actual Stripe call - `unit_amount`
 * from a fractional price (e.g. 129.99) is exactly the kind of thing that
 * is untestable inline and costs real money when it silently rounds wrong.
 */
export function buildCheckoutParams(
  product: Pick<Product, "id" | "slug" | "name" | "currency" | "price" | "images">,
  size: string | undefined,
  origin: string
): Stripe.Checkout.SessionCreateParams {
  return {
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
            // Wix CDN or a Supabase Storage URL): safe to hand to
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
  };
}
