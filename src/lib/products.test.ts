import { describe, expect, it } from "vitest";
import { decideInventoryEffect } from "./products";

describe("decideInventoryEffect", () => {
  it("flips an untracked (stockQuantity null) In Stock one-of-one straight to Out of Stock", () => {
    expect(decideInventoryEffect({ availability: "In Stock", stockQuantity: null })).toBe("flip_to_out_of_stock");
  });

  it("treats a missing stockQuantity the same as null (untracked)", () => {
    expect(decideInventoryEffect({ availability: "In Stock", stockQuantity: undefined })).toBe("flip_to_out_of_stock");
  });

  it("decrements a tracked In Stock product with quantity remaining", () => {
    expect(decideInventoryEffect({ availability: "In Stock", stockQuantity: 5 })).toBe("decrement");
  });

  it("still calls for a decrement at quantity 1, letting the atomic RPC be the source of truth for the result", () => {
    expect(decideInventoryEffect({ availability: "In Stock", stockQuantity: 1 })).toBe("decrement");
  });

  it("does nothing for Made to Order regardless of stockQuantity: unbounded, never flipped", () => {
    expect(decideInventoryEffect({ availability: "Made to Order", stockQuantity: null })).toBe("none");
    expect(decideInventoryEffect({ availability: "Made to Order", stockQuantity: 3 })).toBe("none");
  });

  it("does nothing for a product already Out of Stock", () => {
    expect(decideInventoryEffect({ availability: "Out of Stock", stockQuantity: null })).toBe("none");
  });
});
