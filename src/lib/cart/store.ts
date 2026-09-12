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

function readFromStorage(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
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
