import type { CartLine } from "./store";

/**
 * Pure array transformations for cart state, extracted out of store.ts (a
 * "use client" module wrapping localStorage + a pub-sub, neither of which
 * is meaningfully testable without a real browser - see CLAUDE.md's Tests
 * section on why this codebase tests decision logic, not browser glue).
 * These are the actual decisions worth getting right and regression-testing
 * directly: what happens when the same product+size is added twice, what
 * "remove" and "set quantity to zero" actually do.
 */

export function sameLine(a: Pick<CartLine, "productId" | "size">, b: Pick<CartLine, "productId" | "size">): boolean {
  return a.productId === b.productId && (a.size ?? null) === (b.size ?? null);
}

/** Adds a line, or increases quantity if the same product+size is already
 *  present (a second "Add to cart" click on the same ring/size merges into
 *  one line rather than creating a duplicate). */
export function mergeCartLine(lines: CartLine[], line: Omit<CartLine, "quantity">, quantity: number): CartLine[] {
  const existingIndex = lines.findIndex((l) => sameLine(l, line));
  if (existingIndex >= 0) {
    return lines.map((l, i) => (i === existingIndex ? { ...l, quantity: l.quantity + quantity } : l));
  }
  return [...lines, { ...line, quantity }];
}

export function removeCartLine(lines: CartLine[], productId: string, size?: string): CartLine[] {
  return lines.filter((l) => !sameLine(l, { productId, size }));
}

/** Quantity below 1 removes the line entirely, rather than leaving a
 *  zero-quantity row a customer would need a separate action to clear. */
export function setCartLineQuantity(lines: CartLine[], productId: string, size: string | undefined, quantity: number): CartLine[] {
  if (quantity < 1) return removeCartLine(lines, productId, size);
  return lines.map((l) => (sameLine(l, { productId, size }) ? { ...l, quantity } : l));
}

export function cartTotalCount(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}
