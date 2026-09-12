import { describe, expect, it } from "vitest";
import { buildCartCheckoutParams, checkCartPurchasable, checkPurchasable } from "./checkoutParams";

describe("checkPurchasable", () => {
  it("allows a published, in-stock product", () => {
    expect(checkPurchasable({ isPublished: true, availability: "In Stock" })).toEqual({ ok: true });
  });

  it("allows a published Made to Order product", () => {
    expect(checkPurchasable({ isPublished: true, availability: "Made to Order" })).toEqual({ ok: true });
  });

  it("rejects an unpublished product", () => {
    const result = checkPurchasable({ isPublished: false, availability: "In Stock" });
    expect(result.ok).toBe(false);
  });

  it("rejects a missing product", () => {
    const result = checkPurchasable(undefined);
    expect(result.ok).toBe(false);
  });

  it("rejects an Out of Stock product even if isPublished", () => {
    const result = checkPurchasable({ isPublished: true, availability: "Out of Stock" });
    expect(result.ok).toBe(false);
  });

  it("allows checkout with no size for a product that has no sizes to choose from", () => {
    expect(checkPurchasable({ isPublished: true, availability: "In Stock", availableSizes: undefined })).toEqual({ ok: true });
  });

  it("allows a size that's actually one of the product's availableSizes", () => {
    expect(checkPurchasable({ isPublished: true, availability: "In Stock", availableSizes: ["51", "54", "56"] }, "54")).toEqual({ ok: true });
  });

  it("rejects a size that is not in the product's availableSizes", () => {
    // createCartCheckoutSession is a Server Action, directly callable with
    // any string regardless of what the UI actually offers; this closes
    // that gap rather than just trusting the caller.
    const result = checkPurchasable({ isPublished: true, availability: "In Stock", availableSizes: ["51", "54", "56"] }, "999");
    expect(result.ok).toBe(false);
  });

  it("rejects any size at all for a product with no sizes defined", () => {
    const result = checkPurchasable({ isPublished: true, availability: "In Stock", availableSizes: undefined }, "54");
    expect(result.ok).toBe(false);
  });

  it("defaults quantity to 1 and allows it", () => {
    expect(checkPurchasable({ isPublished: true, availability: "In Stock" })).toEqual({ ok: true });
  });

  it("rejects a zero or negative quantity", () => {
    expect(checkPurchasable({ isPublished: true, availability: "In Stock" }, undefined, 0).ok).toBe(false);
    expect(checkPurchasable({ isPublished: true, availability: "In Stock" }, undefined, -1).ok).toBe(false);
  });

  it("rejects a non-integer quantity", () => {
    expect(checkPurchasable({ isPublished: true, availability: "In Stock" }, undefined, 1.5).ok).toBe(false);
  });

  it("rejects quantity above 1 for an untracked one-of-one In Stock piece", () => {
    const result = checkPurchasable({ isPublished: true, availability: "In Stock", stockQuantity: null }, undefined, 2);
    expect(result.ok).toBe(false);
  });

  it("allows quantity up to the tracked stock count", () => {
    expect(checkPurchasable({ isPublished: true, availability: "In Stock", stockQuantity: 3 }, undefined, 3)).toEqual({ ok: true });
  });

  it("rejects quantity above the tracked stock count", () => {
    const result = checkPurchasable({ isPublished: true, availability: "In Stock", stockQuantity: 3 }, undefined, 4);
    expect(result.ok).toBe(false);
  });

  it("allows any quantity for a Made to Order piece (unbounded by design)", () => {
    expect(checkPurchasable({ isPublished: true, availability: "Made to Order" }, undefined, 50)).toEqual({ ok: true });
  });
});

describe("checkCartPurchasable", () => {
  const ilsProduct = { isPublished: true, availability: "In Stock" as const, currency: "ILS" as const };
  const usdProduct = { isPublished: true, availability: "In Stock" as const, currency: "USD" as const };

  it("rejects an empty cart", () => {
    expect(checkCartPurchasable([]).ok).toBe(false);
  });

  it("allows a cart of one purchasable line", () => {
    expect(checkCartPurchasable([{ product: ilsProduct, quantity: 1 }])).toEqual({ ok: true });
  });

  it("allows multiple lines in the same currency", () => {
    expect(checkCartPurchasable([{ product: ilsProduct, quantity: 1 }, { product: { ...ilsProduct, stockQuantity: 5 }, quantity: 2 }])).toEqual({
      ok: true,
    });
  });

  it("rejects the whole cart if any single line isn't purchasable", () => {
    const result = checkCartPurchasable([
      { product: ilsProduct, quantity: 1 },
      { product: { ...ilsProduct, availability: "Out of Stock" }, quantity: 1 },
    ]);
    expect(result.ok).toBe(false);
  });

  it("rejects a cart mixing currencies, even if every individual line is otherwise purchasable", () => {
    const result = checkCartPurchasable([
      { product: ilsProduct, quantity: 1 },
      { product: usdProduct, quantity: 1 },
    ]);
    expect(result.ok).toBe(false);
  });
});

describe("buildCartCheckoutParams", () => {
  const ring = {
    id: "prod_1",
    slug: "test-ring",
    name: "Test Ring",
    currency: "ILS" as const,
    price: 900,
    images: ["4bc845_abc123.jpg"],
  };
  const necklace = {
    id: "prod_2",
    slug: "test-necklace",
    name: "Test Necklace",
    currency: "ILS" as const,
    price: 500,
    images: [] as string[],
  };

  it("builds one line item per cart line", () => {
    const params = buildCartCheckoutParams(
      [
        { product: ring, quantity: 1 },
        { product: necklace, quantity: 2 },
      ],
      "https://akhjewelry.com"
    );
    expect(params.line_items).toHaveLength(2);
  });

  it("converts a whole-number price to the smallest currency unit correctly", () => {
    const params = buildCartCheckoutParams([{ product: ring, quantity: 1 }], "https://akhjewelry.com");
    expect(params.line_items![0].price_data!.unit_amount).toBe(90000);
  });

  it("rounds a fractional price correctly instead of truncating or drifting from floating point", () => {
    // 129.99 * 100 = 12998.999999999998 in floating point; must round to
    // 12999, not truncate to 12998 (which would silently undercharge).
    const params = buildCartCheckoutParams([{ product: { ...ring, price: 129.99 }, quantity: 1 }], "https://akhjewelry.com");
    expect(params.line_items![0].price_data!.unit_amount).toBe(12999);
  });

  it("carries quantity through to Stripe directly, rather than pre-multiplying the price", () => {
    const params = buildCartCheckoutParams([{ product: ring, quantity: 3 }], "https://akhjewelry.com");
    expect(params.line_items![0].quantity).toBe(3);
    expect(params.line_items![0].price_data!.unit_amount).toBe(90000);
  });

  it("lowercases the currency for Stripe", () => {
    const params = buildCartCheckoutParams([{ product: ring, quantity: 1 }], "https://akhjewelry.com");
    expect(params.line_items![0].price_data!.currency).toBe("ils");
  });

  it("includes a size description only when a size is given", () => {
    const withSize = buildCartCheckoutParams([{ product: ring, size: "54", quantity: 1 }], "https://akhjewelry.com");
    expect(withSize.line_items![0].price_data!.product_data!.description).toBe("Size 54");

    const withoutSize = buildCartCheckoutParams([{ product: ring, quantity: 1 }], "https://akhjewelry.com");
    expect(withoutSize.line_items![0].price_data!.product_data!.description).toBeUndefined();
  });

  it("omits the images array when the product has no images, rather than passing an empty/undefined entry", () => {
    const params = buildCartCheckoutParams([{ product: necklace, quantity: 1 }], "https://akhjewelry.com");
    expect(params.line_items![0].price_data!.product_data!.images).toBeUndefined();
  });

  it("points success and cancel URLs at the given origin, cancel going to the cart (not a single product)", () => {
    const params = buildCartCheckoutParams([{ product: ring, quantity: 1 }], "https://akhjewelry.com");
    expect(params.success_url).toBe("https://akhjewelry.com/order/success?session_id={CHECKOUT_SESSION_ID}");
    expect(params.cancel_url).toBe("https://akhjewelry.com/cart");
  });

  it("carries productId, slug and size through each line's own metadata for the webhook to read back", () => {
    const params = buildCartCheckoutParams(
      [
        { product: ring, size: "54", quantity: 1 },
        { product: necklace, quantity: 1 },
      ],
      "https://akhjewelry.com"
    );
    // On the line item itself, not nested under price_data.product_data -
    // verified live against Stripe's real API that only the former
    // round-trips onto listLineItems()'s plain (unexpanded) response.
    expect(params.line_items![0].metadata).toEqual({ productId: "prod_1", slug: "test-ring", name: "Test Ring", size: "54" });
    expect(params.line_items![1].metadata).toEqual({ productId: "prod_2", slug: "test-necklace", name: "Test Necklace", size: "" });
  });

  it("does not guard against a zero or negative price: passes it straight through to unit_amount", () => {
    // Documented gap, not a claim this is correct behavior: the admin
    // ProductForm's price input only enforces `min={0}` at the HTML level
    // (not server-side), so a 0 or negative price could reach here. Stripe
    // itself rejects a non-positive unit_amount at the API call, but by
    // then it's an opaque runtime error surfaced to the customer as
    // "Could not start checkout," not a clear admin-facing validation
    // message at the point the bad price was actually saved.
    const zero = buildCartCheckoutParams([{ product: { ...ring, price: 0 }, quantity: 1 }], "https://akhjewelry.com");
    expect(zero.line_items![0].price_data!.unit_amount).toBe(0);
    const negative = buildCartCheckoutParams([{ product: { ...ring, price: -50 }, quantity: 1 }], "https://akhjewelry.com");
    expect(negative.line_items![0].price_data!.unit_amount).toBe(-5000);
  });
});
