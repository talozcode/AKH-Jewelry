"use client";

import { useState } from "react";
import { Product } from "@/lib/types";
import { PlaceholderArt } from "./PlaceholderArt";

const VIEWS: { label: string; variant: "light" | "dark" }[] = [
  { label: "Front view", variant: "light" },
  { label: "Alternate angle", variant: "light" },
  { label: "Macro detail", variant: "dark" },
  { label: "On body", variant: "dark" },
];

export function Gallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  return (
    <div>
      <div
        className="relative aspect-square w-full cursor-zoom-in overflow-hidden bg-ivory-deep"
        onClick={() => setZoomed((v) => !v)}
      >
        <div className={`h-full w-full transition-transform duration-300 ${zoomed ? "scale-150" : "scale-100"}`}>
          <PlaceholderArt
            motif={product.motif}
            tone={product.tone}
            variant={VIEWS[active].variant}
            label={VIEWS[active].label}
          />
        </div>
        <span className="absolute bottom-3 right-3 rounded-sm bg-ink/60 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-ivory">
          {zoomed ? "Click to reset" : "Click to zoom"}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-3">
        {VIEWS.map((view, i) => (
          <button
            key={view.label}
            onClick={() => {
              setActive(i);
              setZoomed(false);
            }}
            aria-label={view.label}
            aria-current={active === i}
            className={`aspect-square overflow-hidden border transition ${
              active === i ? "border-copper" : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            <PlaceholderArt motif={product.motif} tone={product.tone} variant={view.variant} />
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-mineral">
        Product video coming soon for this piece.
      </p>
    </div>
  );
}
