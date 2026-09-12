"use client";

import { useState, useTransition } from "react";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { createCartCheckoutSession } from "@/lib/actions/checkout";
import { addToCart } from "@/lib/cart/store";

/** How many of this exact piece a customer could plausibly buy in one
 *  order: an untracked "In Stock" piece is one-of-one (see
 *  decideInventoryEffect in products.ts), so its ceiling is 1 - there's
 *  nothing to select, so no quantity stepper shows at all for it. Tracked
 *  stock caps at the real count; Made to Order is unbounded by design, so
 *  99 is just a sane UI ceiling, not a real limit (checkPurchasable is
 *  the actual server-side authority). */
function maxQuantityFor(product: Pick<Product, "availability" | "stockQuantity">): number {
  if (product.availability === "Made to Order") return 99;
  if (product.availability === "In Stock" && product.stockQuantity) return product.stockQuantity;
  return 1;
}

export function PurchaseArea({ product, contactEmail = "hello@akhjewelry.com" }: { product: Product; contactEmail?: string }) {
  const [size, setSize] = useState(product.availableSizes?.[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const disabled = product.availability === "Out of Stock";
  const maxQuantity = maxQuantityFor(product);

  function handleBuyNow() {
    setError(null);
    startTransition(async () => {
      const result = await createCartCheckoutSession([{ productId: product.id!, size: size || undefined, quantity }]);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      window.location.href = result.url;
    });
  }

  function handleAddToCart() {
    setError(null);
    addToCart(
      {
        productId: product.id!,
        slug: product.slug,
        name: product.name,
        price: product.price,
        currency: product.currency,
        image: product.images[0],
        size: size || undefined,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div>
      {product.availableSizes ? (
        <div className="mb-5">
          <div className="mb-2 flex items-baseline justify-between">
            <label className="text-xs uppercase tracking-[0.1em] text-ink/60">Size</label>
            <a href="/size-guide" className="text-xs text-copper underline underline-offset-2">
              Size guide
            </a>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.availableSizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`min-w-11 border px-3 py-2.5 text-sm transition ${
                  size === s ? "border-charcoal bg-charcoal text-ivory" : "border-ink/25 hover:border-ink"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {!disabled && maxQuantity > 1 ? (
        <div className="mb-5">
          <label className="mb-2 block text-xs uppercase tracking-[0.1em] text-ink/60">Quantity</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="flex h-10 w-10 items-center justify-center border border-ink/25 text-ink transition hover:border-ink disabled:opacity-30"
            >
              -
            </button>
            <span className="w-6 text-center text-sm">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
              disabled={quantity >= maxQuantity}
              aria-label="Increase quantity"
              className="flex h-10 w-10 items-center justify-center border border-ink/25 text-ink transition hover:border-ink disabled:opacity-30"
            >
              +
            </button>
          </div>
        </div>
      ) : null}

      <button
        disabled={disabled || pending}
        onClick={handleBuyNow}
        className="w-full bg-charcoal py-4 text-sm uppercase tracking-[0.14em] text-ivory transition hover:bg-charcoal-soft disabled:cursor-not-allowed disabled:bg-charcoal/30"
      >
        {disabled ? "Out of Stock" : pending ? "Redirecting to checkout…" : "Buy Now"}
      </button>

      {!disabled ? (
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={pending}
          className="mt-3 block w-full border border-charcoal py-3.5 text-center text-sm uppercase tracking-[0.14em] text-charcoal transition hover:bg-charcoal hover:text-ivory disabled:cursor-not-allowed disabled:opacity-40"
        >
          {added ? "Added to cart" : "Add to Cart"}
        </button>
      ) : null}

      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}

      <a
        href={`mailto:${contactEmail}?subject=Enquiry: ${encodeURIComponent(product.name)}`}
        className="mt-3 block w-full border border-ink/25 py-3.5 text-center text-sm uppercase tracking-[0.14em] text-ink transition hover:border-ink"
      >
        Enquire by Email
      </a>

      <ul className="mt-6 space-y-2 text-sm text-ink/70">
        <li>{product.dispatch}</li>
        <li>Free returns within 14 days on in-stock pieces</li>
        <li>Secure payment via Stripe</li>
        <li>Free worldwide shipping</li>
        <li>Arrives in an AKH gift box with a satin pouch, in our branded bag</li>
        <li>International orders may be subject to local customs duties</li>
      </ul>
    </div>
  );
}

export function StickyMobileBar({ product }: { product: Product }) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-ink/10 bg-ivory/95 px-4 pt-3 backdrop-blur md:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div>
        <p className="font-display text-sm">{product.name}</p>
        <p className="text-sm text-ink/70">{formatPrice(product)}</p>
      </div>
      <a
        href="#purchase"
        className="bg-charcoal px-5 py-3 text-xs uppercase tracking-[0.14em] text-ivory"
      >
        Buy Now
      </a>
    </div>
  );
}
