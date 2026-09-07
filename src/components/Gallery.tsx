"use client";

import { useState } from "react";
import { Product } from "@/lib/types";
import { ProductImage } from "./ProductImage";

export function Gallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const images = product.images;

  return (
    <div>
      <div
        className="relative aspect-square w-full cursor-zoom-in overflow-hidden bg-ivory-deep"
        onClick={() => setZoomed((v) => !v)}
      >
        <div className={`h-full w-full transition-transform duration-300 ${zoomed ? "scale-150" : "scale-100"}`}>
          <ProductImage idExt={images[active]} alt={product.name} w={1200} h={1200} />
        </div>
        {images.length > 1 ? (
          <span className="absolute bottom-3 right-3 rounded-sm bg-ink/60 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-ivory">
            {zoomed ? "Click to reset" : "Click to zoom"}
          </span>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => {
                setActive(i);
                setZoomed(false);
              }}
              aria-label={`View ${i + 1}`}
              aria-current={active === i}
              className={`aspect-square overflow-hidden border transition ${
                active === i ? "border-copper" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <ProductImage idExt={img} alt={`${product.name} view ${i + 1}`} w={200} h={200} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
