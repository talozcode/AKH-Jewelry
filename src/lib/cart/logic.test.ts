import { describe, expect, it } from "vitest";
import { cartTotalCount, mergeCartLine, removeCartLine, setCartLineQuantity } from "./logic";
import type { CartLine } from "./store";

function line(overrides: Partial<CartLine> = {}): CartLine {
  return {
    productId: "product-1",
    slug: "anemone",
    name: "Anemone Ring",
    price: 1200,
    currency: "ILS",
    size: undefined,
    quantity: 1,
    ...overrides,
  };
}

describe("mergeCartLine", () => {
  it("adds a new line to an empty cart", () => {
    const result = mergeCartLine([], line(), 1);
    expect(result).toEqual([line({ quantity: 1 })]);
  });

  it("adds a genuinely different product as its own new line", () => {
    const result = mergeCartLine([line()], { ...line(), productId: "product-2" }, 1);
    expect(result).toHaveLength(2);
  });

  it("merges a second add of the same product+size into one line, summing quantity", () => {
    const cart = [line({ quantity: 1 })];
    const result = mergeCartLine(cart, line(), 2);
    expect(result).toEqual([line({ quantity: 3 })]);
  });

  it("treats the same product with a different size as a separate line", () => {
    const cart = [line({ size: "54" })];
    const result = mergeCartLine(cart, line({ size: "56" }), 1);
    expect(result).toHaveLength(2);
  });

  it("treats sized and unsized lines of the same product as separate", () => {
    const cart = [line({ size: undefined })];
    const result = mergeCartLine(cart, line({ size: "54" }), 1);
    expect(result).toHaveLength(2);
  });

  it("does not mutate the original array", () => {
    const cart = [line()];
    mergeCartLine(cart, line(), 1);
    expect(cart).toEqual([line({ quantity: 1 })]);
  });
});

describe("removeCartLine", () => {
  it("removes the matching product+size line", () => {
    const cart = [line({ productId: "a" }), line({ productId: "b" })];
    expect(removeCartLine(cart, "a")).toEqual([line({ productId: "b" })]);
  });

  it("only removes the matching size, leaving other sizes of the same product", () => {
    const cart = [line({ size: "54" }), line({ size: "56" })];
    expect(removeCartLine(cart, "product-1", "54")).toEqual([line({ size: "56" })]);
  });

  it("is a no-op when nothing matches", () => {
    const cart = [line()];
    expect(removeCartLine(cart, "nonexistent")).toEqual(cart);
  });
});

describe("setCartLineQuantity", () => {
  it("updates the quantity of the matching line", () => {
    const cart = [line({ quantity: 1 })];
    expect(setCartLineQuantity(cart, "product-1", undefined, 5)).toEqual([line({ quantity: 5 })]);
  });

  it("removes the line entirely when quantity drops to zero", () => {
    const cart = [line({ quantity: 1 })];
    expect(setCartLineQuantity(cart, "product-1", undefined, 0)).toEqual([]);
  });

  it("removes the line entirely for a negative quantity too", () => {
    const cart = [line({ quantity: 1 })];
    expect(setCartLineQuantity(cart, "product-1", undefined, -1)).toEqual([]);
  });

  it("only affects the matching product+size, not other lines", () => {
    const cart = [line({ productId: "a", quantity: 1 }), line({ productId: "b", quantity: 1 })];
    const result = setCartLineQuantity(cart, "a", undefined, 9);
    expect(result).toEqual([line({ productId: "a", quantity: 9 }), line({ productId: "b", quantity: 1 })]);
  });
});

describe("cartTotalCount", () => {
  it("is 0 for an empty cart", () => {
    expect(cartTotalCount([])).toBe(0);
  });

  it("sums quantity across all lines, not just counting lines", () => {
    expect(cartTotalCount([line({ quantity: 2 }), line({ productId: "b", quantity: 3 })])).toBe(5);
  });
});
