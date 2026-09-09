"use client";

import { useState, useTransition } from "react";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { createCheckoutSession } from "@/lib/actions/checkout";

export function PurchaseArea({ product, contactEmail = "hello@akhjewelry.com" }: { product: Product; contactEmail?: string }) {
  const [size, setSize] = useState(product.availableSizes?.[0] ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const disabled = product.availability === "Out of Stock";

  function handleBuyNow() {
    setError(null);
    startTransition(async () => {
      const result = await createCheckoutSession(product.id!, size || undefined);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      window.location.href = result.url;
    });
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
                className={`min-w-11 border px-3 py-2 text-sm transition ${
                  size === s ? "border-charcoal bg-charcoal text-ivory" : "border-ink/25 hover:border-ink"
                }`}
              >
                {s}
              </button>
            ))}
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
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-ink/10 bg-ivory/95 px-4 py-3 backdrop-blur md:hidden">
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
