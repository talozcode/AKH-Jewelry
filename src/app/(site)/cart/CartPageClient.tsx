"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { createCartCheckoutSession } from "@/lib/actions/checkout";
import { removeFromCart, updateCartQuantity, useCart } from "@/lib/cart/store";

function currencySymbol(currency: string) {
  return currency === "ILS" ? "₪" : currency === "USD" ? "$" : currency + " ";
}

/**
 * A real cart, replacing the old permanent "checkout is launching soon"
 * placeholder - checkout has taken real payment since 2026-09-09, and
 * multi-item support (this page) since 2026-09-12. State lives in
 * lib/cart/store.ts (localStorage-backed, no account system to attach a
 * server-side cart to). Split into its own client component (page.tsx
 * stays a Server Component) because it needs useCart()'s
 * useSyncExternalStore, and a "use client" page can't export `metadata`.
 */
export function CartPageClient() {
  const { lines } = useCart();
  const [checkingOut, startCheckout] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const currency = lines[0]?.currency;
  const mixedCurrency = lines.some((l) => l.currency !== currency);
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  function handleCheckout() {
    setError(null);
    startCheckout(async () => {
      const result = await createCartCheckoutSession(
        lines.map((l) => ({ productId: l.productId, size: l.size, quantity: l.quantity }))
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      window.location.href = result.url;
    });
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl">Your cart is empty</h1>
        <p className="mt-4 text-ink/70">Browse the collection and add a piece to get started.</p>
        <Link
          href="/shop"
          className="mt-8 inline-block border border-ink px-8 py-4 text-sm text-ink transition hover:bg-ink hover:text-ivory"
        >
          Shop the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl">Your cart</h1>

      <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
        {lines.map((line) => (
          <li key={`${line.productId}-${line.size ?? ""}`} className="flex items-center gap-4 py-5">
            <Link href={`/product/${line.slug}`} className="min-w-0 flex-1">
              <p className="font-display text-base">{line.name}</p>
              {line.size ? <p className="mt-0.5 text-xs text-ink/60">Size {line.size}</p> : null}
              <p className="mt-1 text-sm text-ink/70">
                {currencySymbol(line.currency)}
                {line.price.toLocaleString()}
              </p>
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={line.quantity <= 1}
                onClick={() => updateCartQuantity(line.productId, line.size, line.quantity - 1)}
                aria-label="Decrease quantity"
                className="flex h-9 w-9 items-center justify-center border border-ink/25 text-ink transition hover:border-ink disabled:cursor-not-allowed disabled:opacity-30"
              >
                -
              </button>
              <span className="w-6 text-center text-sm">{line.quantity}</span>
              <button
                type="button"
                onClick={() => updateCartQuantity(line.productId, line.size, line.quantity + 1)}
                aria-label="Increase quantity"
                className="flex h-9 w-9 items-center justify-center border border-ink/25 text-ink transition hover:border-ink"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => removeFromCart(line.productId, line.size)}
              className="ml-2 text-xs text-ink/50 underline underline-offset-2 hover:text-ink"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      {mixedCurrency ? (
        <p className="mt-6 text-sm text-red-700">
          Your cart has items priced in different currencies (ILS and USD) - a single order can only be charged in one
          currency. Remove one before checking out.
        </p>
      ) : (
        <div className="mt-6 flex items-center justify-between text-sm">
          <span className="text-ink/70">Subtotal</span>
          <span className="font-display text-lg">
            {currencySymbol(currency ?? "ILS")}
            {subtotal.toLocaleString()}
          </span>
        </div>
      )}

      <button
        disabled={checkingOut || mixedCurrency}
        onClick={handleCheckout}
        className="mt-6 w-full bg-charcoal py-4 text-sm uppercase tracking-[0.14em] text-ivory transition hover:bg-charcoal-soft disabled:cursor-not-allowed disabled:bg-charcoal/30"
      >
        {checkingOut ? "Redirecting to checkout…" : "Checkout"}
      </button>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}

      <p className="mt-6 text-center text-xs text-ink/50">Free worldwide shipping. Secure payment via Stripe.</p>
    </div>
  );
}
