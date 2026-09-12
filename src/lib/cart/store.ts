"use client";

import { useSyncExternalStore } from "react";
import { cartTotalCount, mergeCartLine, removeCartLine, setCartLineQuantity } from "./logic";

/**
 * Client-side cart state, persisted to localStorage - there's no user
 * account system in this app (see CLAUDE.md's CMS section), so a cart is
 * necessarily per-browser, ephemeral pre-purchase state, same as most
 * storefronts without accounts. Built as a module-level singleton store +
 * `useSyncExternalStore`, the same pattern already used for the admin
 * theme toggle (see admin/(console)/ThemeToggle.tsx): reading
 * localStorage outside React and re-rendering every subscribed component
 * when it changes needs a real pub-sub, not `useState` seeded once at
 * mount (which would hydration-mismatch, since the server has no
 * localStorage to read) or `useEffect` (which trips
 * `react-hooks/set-state-in-effect`).
 *
 * The actual add/remove/quantity decisions live in ./logic.ts as pure
 * array functions (directly tested) - this file is just the browser-glue
 * wrapper around them (localStorage + the pub-sub), which isn't
 * meaningfully testable without a real DOM.
 */

const STORAGE_KEY = "akh-cart";

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  currency: "ILS" | "USD";
  image?: string;
  size?: string;
  quantity: number;
};

const listeners = new Set<() => void>();
let cachedLines: CartLine[] | null = null;

/**
 * A QA audit found that `Array.isArray(parsed)` alone wasn't enough: any
 * element missing a required field (e.g. a hand-edited or corrupted
 * value, or an older/newer cart-line shape from a different deploy) would
 * pass through unvalidated, and the cart page does `line.price.
 * toLocaleString()` unconditionally - a `TypeError` on render, with no
 * error boundary anywhere in this app, leaving the visitor stuck on a raw
 * Next.js error page unable to see or clear their cart. Each line's shape
 * is checked here instead; a line that fails is silently dropped (the
 * rest of the cart still loads) rather than either crashing the page or
 * trusting an untyped `unknown`.
 */
function isValidCartLine(value: unknown): value is CartLine {
  if (typeof value !== "object" || value === null) return false;
  const line = value as Record<string, unknown>;
  return (
    typeof line.productId === "string" &&
    typeof line.slug === "string" &&
    typeof line.name === "string" &&
    Number.isFinite(line.price) &&
    (line.currency === "ILS" || line.currency === "USD") &&
    (line.image === undefined || typeof line.image === "string") &&
    (line.size === undefined || typeof line.size === "string") &&
    Number.isInteger(line.quantity) &&
    (line.quantity as number) >= 1
  );
}

function readFromStorage(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValidCartLine) : [];
  } catch {
    // Malformed JSON (a hand-edited or corrupted value) or storage access
    // denied - either way, an empty cart is the only safe fallback.
    return [];
  }
}

function writeToStorage(lines: CartLine[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Private browsing/storage blocked: the cart still works for this
    // page view, it just won't persist to the next one.
  }
}

// A QA audit found there was no cross-tab sync at all: `cachedLines` is a
// module-level variable per page load, only ever updated by THIS tab's own
// commit() calls, so a second tab's write to localStorage went completely
// unnoticed here. Two tabs open on an empty cart, each adding a different
// piece, would have the second tab's write silently overwrite the first
// tab's item with no error to either tab (mergeCartLine operates on this
// tab's own stale cachedLines, not the real current storage value). The
// `storage` event fires in every OTHER tab/window sharing this origin
// whenever localStorage changes (never in the tab that made the change
// itself, which is why `commit()` above still calls listeners directly) -
// invalidating the cache and notifying subscribers here is what makes a
// change in one tab actually show up in another.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    cachedLines = null;
    for (const listener of listeners) listener();
  });
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function getSnapshot(): CartLine[] {
  if (cachedLines === null) cachedLines = readFromStorage();
  return cachedLines;
}

function getServerSnapshot(): CartLine[] {
  return [];
}

function commit(next: CartLine[]) {
  cachedLines = next;
  writeToStorage(next);
  for (const listener of listeners) listener();
}

export function addToCart(line: Omit<CartLine, "quantity">, quantity: number = 1): void {
  commit(mergeCartLine(getSnapshot(), line, quantity));
}

export function removeFromCart(productId: string, size?: string): void {
  commit(removeCartLine(getSnapshot(), productId, size));
}

export function updateCartQuantity(productId: string, size: string | undefined, quantity: number): void {
  commit(setCartLineQuantity(getSnapshot(), productId, size, quantity));
}

export function clearCart(): void {
  commit([]);
}

export function useCart(): { lines: CartLine[]; totalCount: number } {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { lines, totalCount: cartTotalCount(lines) };
}
