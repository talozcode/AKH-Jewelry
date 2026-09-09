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
      <ul className="divide-y divide-slate-100 rounded-md border border-slate-200 bg-white">
        {slugs.map((slug, i) => {
          const product = bySlug.get(slug);
          return (
            <li key={slug} className="flex items-center justify-between px-3 py-2 text-sm">
              <span className="text-slate-700">
                {product ? product.name : slug}
                {!product ? <span className="ml-2 text-xs text-red-600">(missing)</span> : null}
              </span>
              <span className="flex items-center gap-3 text-xs text-slate-400">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="disabled:opacity-30">
                  ↑
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === slugs.length - 1} className="disabled:opacity-30">
                  ↓
                </button>
                <button type="button" onClick={() => remove(slug)} className="hover:text-red-600">
                  Remove
                </button>
              </span>
            </li>
          );
        })}
        {slugs.length === 0 ? <li className="px-3 py-3 text-sm text-slate-400">No products in this collection yet.</li> : null}
      </ul>
      <div className="mt-3 flex gap-2">
        <select
          value={adding}
          onChange={(e) => setAdding(e.target.value)}
          className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
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
          className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  );
}
