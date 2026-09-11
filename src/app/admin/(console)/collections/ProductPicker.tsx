"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";

export function ProductPicker({
  allProducts,
  slugs,
  onChange,
}: {
  allProducts: Product[];
  slugs: string[];
  onChange: (slugs: string[]) => void;
}) {
  const [adding, setAdding] = useState("");
  const bySlug = new Map(allProducts.map((p) => [p.slug, p]));
  const available = allProducts.filter((p) => !slugs.includes(p.slug));

  function move(index: number, dir: -1 | 1) {
    const next = [...slugs];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }
  function remove(slug: string) {
    onChange(slugs.filter((s) => s !== slug));
  }
  function add() {
    if (!adding) return;
    onChange([...slugs, adding]);
    setAdding("");
  }

  return (
    <div>
      <ul className="divide-y divide-[var(--admin-border)] rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)]">
        {slugs.map((slug, i) => {
          const product = bySlug.get(slug);
          return (
            <li key={slug} className="flex items-center justify-between px-3 py-2 text-sm">
              <span className="text-[var(--admin-text)]">
                {product ? product.name : slug}
                {!product ? <span className="ml-2 text-xs text-[var(--admin-danger)]">(missing)</span> : null}
              </span>
              <span className="flex items-center gap-3 text-xs text-[var(--admin-text-faint)]">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1.5 disabled:opacity-30">
                  ↑
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === slugs.length - 1} className="p-1.5 disabled:opacity-30">
                  ↓
                </button>
                <button type="button" onClick={() => remove(slug)} className="p-1.5 hover:text-[var(--admin-danger)]">
                  Remove
                </button>
              </span>
            </li>
          );
        })}
        {slugs.length === 0 ? <li className="px-3 py-3 text-sm text-[var(--admin-text-faint)]">No products in this collection yet.</li> : null}
      </ul>
      <div className="mt-3 flex gap-2">
        <select
          value={adding}
          onChange={(e) => setAdding(e.target.value)}
          className="flex-1 rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--admin-accent-soft)] focus:ring-1 focus:ring-[var(--admin-accent-soft)]"
        >
          <option value="">Add a product…</option>
          {available.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={add}
          disabled={!adding}
          className="rounded-md border border-[var(--admin-border-strong)] px-4 py-2 text-sm text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)] disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  );
}
