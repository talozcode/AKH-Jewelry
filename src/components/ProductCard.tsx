"use client";

import Link from "next/link";
import { useState } from "react";
import { Product } from "@/lib/types";
import { PlaceholderArt } from "./PlaceholderArt";
import { formatPrice } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <div className="group relative">
      <Link href={`/product/${product.slug}`} className="block">
        <div
          className="relative aspect-[4/5] w-full overflow-hidden bg-ivory-deep"
          onMouseEnter={() => {}}
        >
          <div className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-0">
            <PlaceholderArt motif={product.motif} tone={product.tone} label="Front view" />
          </div>
          <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <PlaceholderArt motif={product.motif} tone={product.tone} label="Alternate angle" />
          </div>

          {product.availability !== "In Stock" ? (
            <span className="absolute left-3 top-3 bg-charcoal/90 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-ivory">
              {product.availability}
            </span>
          ) : null}
          {product.limitedEdition ? (
            <span className="absolute left-3 bottom-3 bg-copper/90 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-ivory">
              One of one
            </span>
          ) : null}
        </div>
      </Link>

      <button
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        onClick={(e) => {
          e.preventDefault();
          setWishlisted((v) => !v);
        }}
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-ivory/80 text-ink/70 backdrop-blur transition hover:text-copper"
      >
        <HeartIcon filled={wishlisted} />
      </button>

      <Link href={`/product/${product.slug}`} className="mt-3 block">
        <h3 className="font-display text-base text-ink">{product.name}</h3>
        <p className="mt-1 text-xs uppercase tracking-[0.1em] text-mineral">
          {product.material}
          {product.stone ? ` · ${product.stone.split(",")[0]}` : ""}
        </p>
        <p className="mt-1.5 text-sm text-ink/80">{formatPrice(product)}</p>
      </Link>
    </div>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6">
      <path d="M12 20.5S3 14.7 3 8.8C3 5.6 5.5 3 8.6 3c1.8 0 3.3.9 4.4 2.4C14.1 3.9 15.6 3 17.4 3 20.5 3 23 5.6 23 8.8c0 5.9-11 11.7-11 11.7Z" />
    </svg>
  );
}
