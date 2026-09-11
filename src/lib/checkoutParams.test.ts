import { describe, expect, it } from "vitest";
import { buildCheckoutParams, checkPurchasable } from "./checkoutParams";

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
});

describe("buildCheckoutParams", () => {
  const baseProduct = {
    id: "prod_1",
    slug: "test-ring",
    name: "Test Ring",
    currency: "ILS" as const,
    price: 900,
    images: ["4bc845_abc123.jpg"],
  };

  it("converts a whole-number price to the smallest currency unit correctly", () => {
    const params = buildCheckoutParams(baseProduct, undefined, "https://akhjewelry.com");
    const lineItem = params.line_items![0];
    expect(lineItem.price_data!.unit_amount).toBe(90000);
  });

  it("rounds a fractional price correctly instead of truncating or drifting from floating point", () => {
    // 129.99 * 100 = 12998.999999999998 in floating point; must round to
    // 12999, not truncate to 12998 (which would silently undercharge).
    const params = buildCheckoutParams({ ...baseProduct, price: 129.99 }, undefined, "https://akhjewelry.com");
    expect(params.line_items![0].price_data!.unit_amount).toBe(12999);
  });

  it("lowercases the currency for Stripe", () => {
    const params = buildCheckoutParams(baseProduct, undefined, "https://akhjewelry.com");
    expect(params.line_items![0].price_data!.currency).toBe("ils");
  });

  it("includes a size description only when a size is given", () => {
    const withSize = buildCheckoutParams(baseProduct, "54", "https://akhjewelry.com");
    expect(withSize.line_items![0].price_data!.product_data!.description).toBe("Size 54");

    const withoutSize = buildCheckoutParams(baseProduct, undefined, "https://akhjewelry.com");
    expect(withoutSize.line_items![0].price_data!.product_data!.description).toBeUndefined();
  });

  it("omits the images array when the product has no images, rather than passing an empty/undefined entry", () => {
    const params = buildCheckoutParams({ ...baseProduct, images: [] }, undefined, "https://akhjewelry.com");
    expect(params.line_items![0].price_data!.product_data!.images).toBeUndefined();
  });

  it("points success and cancel URLs at the given origin and this product's slug", () => {
    const params = buildCheckoutParams(baseProduct, undefined, "https://akhjewelry.com");
    expect(params.success_url).toBe("https://akhjewelry.com/order/success?session_id={CHECKOUT_SESSION_ID}");
    expect(params.cancel_url).toBe("https://akhjewelry.com/product/test-ring");
  });

  it("carries productId, slug and size through metadata for the webhook to read back", () => {
    const params = buildCheckoutParams(baseProduct, "54", "https://akhjewelry.com");
    expect(params.metadata).toEqual({ productId: "prod_1", slug: "test-ring", size: "54" });
  });

  it("defaults metadata.size to an empty string, never undefined (Stripe metadata values must be strings)", () => {
    const params = buildCheckoutParams(baseProduct, undefined, "https://akhjewelry.com");
    expect(params.metadata!.size).toBe("");
  });
});
