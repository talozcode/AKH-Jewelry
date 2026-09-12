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

/**
 * One line of a cart/checkout: `size` is checked here, not just trusted
 * from the caller: createCartCheckoutSession is a Server Action, directly
 * callable with any string regardless of what the UI actually offers (it
 * only ever sends `undefined` or one of `product.availableSizes`). No
 * financial impact from a bad size either way (price doesn't depend on
 * it), but an unvalidated size would land verbatim in the Stripe line-item
 * description and the `order_items.size` column, so a tampered/direct
 * call could write arbitrary text there. `quantity` is checked against
 * actual stock for the same reason: a direct call could otherwise request
 * more than exists before the atomic per-unit decrement ever runs.
 */
export function checkPurchasable(
  product: Pick<Product, "isPublished" | "availability" | "availableSizes" | "stockQuantity"> | undefined,
  size?: string,
  quantity: number = 1
): PurchasabilityCheck {
  if (!product || !product.isPublished) return { ok: false, error: "This piece is no longer available." };
  if (product.availability === "Out of Stock") return { ok: false, error: "This piece is out of stock." };
  if (size !== undefined) {
    if (!product.availableSizes || !product.availableSizes.includes(size)) {
      return { ok: false, error: "Please select a valid size." };
    }
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { ok: false, error: "Quantity must be at least 1." };
  }
  if (product.availability === "In Stock") {
    if (product.stockQuantity === null || product.stockQuantity === undefined) {
      // Untracked "In Stock" means one-of-one (see decideInventoryEffect in
      // products.ts): there is exactly one physical piece, so a quantity
      // above 1 can never be fulfilled regardless of what a race-free
      // decrement would otherwise catch.
      if (quantity > 1) return { ok: false, error: "Only one of this piece exists - quantity can't be more than 1." };
    } else if (quantity > product.stockQuantity) {
      return { ok: false, error: `Only ${product.stockQuantity} left in stock.` };
    }
  }
  return { ok: true };
}

/**
 * A whole cart is purchasable only if every line is, AND every line shares
 * one currency - a single Stripe Checkout Session can only charge in one
 * currency, and this shop's catalog deliberately mixes ILS and USD per
 * product (see CLAUDE.md), so a cart spanning both has no single valid
 * session to build.
 *
 * `stockQuantity` lives on the PRODUCT row, not per size - it's one shared
 * pool across every size of that product. `checkPurchasable` above only
 * ever sees one line at a time, so two lines for the same product at
 * *different* sizes (never merged upstream, since the merge key is
 * product+size) each pass their own quantity against the full stock figure
 * independently - 5 of size 6 plus 5 of size 7 against a 5-unit pool both
 * "fit" on their own but together oversell by 5. This aggregates requested
 * quantity per product id first and checks that sum against stock, on top
 * of (not instead of) each line's own per-size validation.
 */
export function checkCartPurchasable(
  lines: {
    product: (Pick<Product, "id" | "isPublished" | "availability" | "availableSizes" | "stockQuantity" | "currency">) | undefined;
    size?: string;
    quantity: number;
  }[]
): PurchasabilityCheck {
  if (lines.length === 0) return { ok: false, error: "Your cart is empty." };
  for (const line of lines) {
    const check = checkPurchasable(line.product, line.size, line.quantity);
    if (!check.ok) return check;
  }
  const totalsByProduct = new Map<string, number>();
  for (const line of lines) {
    // Product.id is optional at the type level (absent only on the frozen
    // legacy design-concepts seed data, never on anything that reaches
    // real checkout - see types.ts), but this map needs a real key.
    const id = line.product!.id ?? "";
    totalsByProduct.set(id, (totalsByProduct.get(id) ?? 0) + line.quantity);
  }
  for (const line of lines) {
    const product = line.product!;
    if (
      product.availability === "In Stock" &&
      product.stockQuantity !== null &&
      product.stockQuantity !== undefined &&
      totalsByProduct.get(product.id ?? "")! > product.stockQuantity
    ) {
      return { ok: false, error: `Only ${product.stockQuantity} of this piece left in stock across all sizes.` };
    }
  }
  const currencies = new Set(lines.map((l) => l.product!.currency));
  if (currencies.size > 1) {
    return { ok: false, error: "Your cart has items priced in different currencies - check out one currency at a time." };
  }
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

export type CheckoutLine = {
  product: Pick<Product, "id" | "slug" | "name" | "currency" | "price" | "images">;
  size?: string;
  quantity: number;
};

/** Shared between buildCartCheckoutParams (writes it) and
 *  sessionToOrderRow (reads it back), so the two can't drift apart. */
export const SPECIAL_INSTRUCTIONS_FIELD_KEY = "gift_note";

/**
 * Builds the params object for stripe.checkout.sessions.create(), pure so
 * the price math is testable without an actual Stripe call - `unit_amount`
 * from a fractional price (e.g. 129.99) is exactly the kind of thing that
 * is untestable inline and costs real money when it silently rounds wrong.
 *
 * One line item per cart line, quantity carried through directly (Stripe
 * charges unit_amount * quantity itself - no need to multiply here).
 * `productId`/`slug`/`name`/`size` are attached as metadata directly on
 * each LINE ITEM (a sibling of `price_data`, not nested inside
 * `price_data.product_data.metadata` - verified live against Stripe's
 * real API: metadata nested under `product_data` only round-trips onto
 * the expanded `price.product.metadata`, not onto the line item's own
 * `metadata`, and needs `expand: ["data.price.product"]` to read back at
 * all. Metadata set on the line item itself round-trips onto
 * `line_item.metadata` with a plain `listLineItems()` call, no expand
 * needed). This is what lets the webhook reconstruct which internal
 * product (and size) each paid line corresponds to, since a Checkout
 * Session's line items aren't included in the
 * `checkout.session.completed` event payload itself.
 */
export function buildCartCheckoutParams(lines: CheckoutLine[], origin: string): Stripe.Checkout.SessionCreateParams {
  return {
    mode: "payment",
    line_items: lines.map((line) => ({
      quantity: line.quantity,
      metadata: {
        productId: line.product.id ?? "",
        slug: line.product.slug,
        // Also carried in metadata (not just as the line's `name`, which
        // Stripe already shows on its own checkout page) so
        // /order/success can display it without a database lookup - that
        // page is unauthenticated and runs immediately after payment,
        // before the webhook may have even run yet.
        name: line.product.name,
        size: line.size ?? "",
      },
      price_data: {
        currency: line.product.currency.toLowerCase(),
        unit_amount: Math.round(line.product.price * 100),
        product_data: {
          name: line.product.name,
          ...(line.size ? { description: `Size ${line.size}` } : {}),
          // wixImg() always returns a full public URL (either the
          // Wix CDN or a Supabase Storage URL): safe to hand to
          // Stripe's checkout page directly, which needs a real
          // publicly reachable image URL, not a bare id.
          ...(line.product.images[0] ? { images: [wixImg(line.product.images[0], 900, 1125)] } : {}),
        },
      },
    })),
    shipping_address_collection: { allowed_countries: [...ALLOWED_SHIPPING_COUNTRIES] },
    success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cart`,
    // One optional free-text field, collected on Stripe's own hosted
    // checkout page - verified live against Stripe's real API
    // (custom_fields is session-level, so this applies to the whole
    // order, not per line item; there's no per-item equivalent available
    // without building a custom checkout UI, which this app deliberately
    // doesn't have). Read back via `session.custom_fields` directly (a
    // plain field on the Session resource, unlike line items, which need
    // a separate listLineItems() call) - see sessionToOrderRow.
    custom_fields: [
      {
        key: SPECIAL_INSTRUCTIONS_FIELD_KEY,
        label: { type: "custom", custom: "Gift note or engraving request (optional)" },
        type: "text",
        optional: true,
        text: { maximum_length: 255 },
      },
    ],
  };
}
