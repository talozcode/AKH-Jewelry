"use client";

import { useState } from "react";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";

export function PurchaseArea({ product }: { product: Product }) {
  const [size, setSize] = useState(product.availableSizes?.[0] ?? "");
  const [reserved, setReserved] = useState(false);
  const disabled = product.availability === "Out of Stock";

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
                  size === s ? "border-ink bg-ink text-ivory" : "border-ink/25 hover:border-ink"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <button
        disabled={disabled}
        onClick={() => setReserved(true)}
        className="w-full bg-ink py-4 text-sm uppercase tracking-[0.14em] text-ivory transition hover:bg-charcoal-soft disabled:cursor-not-allowed disabled:bg-ink/30"
      >
        {disabled ? "Out of Stock" : reserved ? "Request Sent" : "Add to Cart"}
      </button>

      {reserved ? (
        <p className="mt-3 text-sm text-ink/70">
          Online checkout is launching soon. Email{" "}
          <a href={`mailto:hello@akhjewelry.com?subject=Reserve ${encodeURIComponent(product.name)}`} className="text-copper underline">
            hello@akhjewelry.com
          </a>{" "}
          with this piece and your size to reserve it now.
        </p>
      ) : (
        <a
          href={`mailto:hello@akhjewelry.com?subject=Enquiry: ${encodeURIComponent(product.name)}`}
          className="mt-3 block w-full border border-ink/25 py-3.5 text-center text-sm uppercase tracking-[0.14em] text-ink transition hover:border-ink"
        >
          Enquire by Email
        </a>
      )}

      <ul className="mt-6 space-y-2 text-sm text-ink/70">
        <li>{product.dispatch}</li>
        <li>Free returns within 14 days on in-stock pieces</li>
        <li>Secure payment via Stripe at checkout launch</li>
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
        className="bg-ink px-5 py-3 text-xs uppercase tracking-[0.14em] text-ivory"
      >
        Add to Cart
      </a>
    </div>
  );
}
