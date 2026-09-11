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

  it("still calls for a decrement at stockQuantity 0 (a data-inconsistency case: In Stock but already at 0)", () => {
    // This function only decides WHETHER to call the decrement RPC, not
    // whether it will succeed - the atomic decrement_product_stock() SQL
    // function's own `WHERE stock_quantity > 0` guard is what actually
    // stops a negative count, and it correctly returns null here (treated
    // as an oversell), never mutating the row. See
    // supabase/migrations/0008_product_stock.sql. This case shouldn't
    // arise in practice (a product should flip to "Out of Stock"
    // availability the moment its tracked count hits 0), but if it ever
    // does via a manual DB edit, the system fails safely rather than
    // silently skipping the RPC call and leaving stock_quantity at 0
    // without ever flagging the sale as oversold.
    expect(decideInventoryEffect({ availability: "In Stock", stockQuantity: 0 })).toBe("decrement");
  });

  it("still calls for a decrement on a negative stockQuantity, a state the DB CHECK constraint should prevent from ever existing", () => {
    expect(decideInventoryEffect({ availability: "In Stock", stockQuantity: -1 })).toBe("decrement");
  });
});
