"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/lib/products";
import { Category } from "@/lib/types";

const CATEGORIES: Category[] = ["Rings", "Necklaces", "Bracelets"];
const MATERIALS = ["Silver", "Gold"] as const;
const STONE_STEMS: [string, string][] = [
  ["Emerald", "emerald"],
  ["Sapphire", "sapphir"],
  ["Garnet", "garnet"],
  ["Tourmaline", "tourmaline"],
  ["Spinel", "spinel"],
  ["Kunzite", "kunzite"],
  ["Ruby", "rub"],
];
const STONES = [...STONE_STEMS.map(([label]) => label), "No stone"] as const;
const AVAILABILITY = ["In Stock", "Made to Order", "Out of Stock"] as const;
const COLLECTIONS = ["Core Collection", "One of One"] as const;
const PRICE_BANDS: { label: string; test: (p: number) => boolean }[] = [
  { label: "Under ₪800", test: (p) => p < 800 },
  { label: "₪800 – ₪1,500", test: (p) => p >= 800 && p <= 1500 },
  { label: "₪1,500 – ₪5,000", test: (p) => p > 1500 && p <= 5000 },
  { label: "Over ₪5,000", test: (p) => p > 5000 },
];

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function ShopClient() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") as Category | null;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<Category[]>(
    initialCategory && CATEGORIES.includes(initialCategory) ? [initialCategory] : []
  );
  const [materialFilter, setMaterialFilter] = useState<string[]>([]);
  const [stoneFilter, setStoneFilter] = useState<string[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState<string[]>([]);
  const [collectionFilter, setCollectionFilter] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter.length && !categoryFilter.includes(p.category)) return false;
      if (materialFilter.length) {
        const isGold = p.material.toLowerCase().includes("gold");
        const tag = isGold ? "Gold" : "Silver";
        if (!materialFilter.includes(tag)) return false;
      }
      if (stoneFilter.length) {
        const lower = p.stone?.toLowerCase() ?? "";
        const stoneTag = p.stone ? STONE_STEMS.find(([, stem]) => lower.includes(stem))?.[0] ?? "No stone" : "No stone";
        if (!stoneFilter.includes(stoneTag)) return false;
      }
      if (availabilityFilter.length && !availabilityFilter.includes(p.availability)) return false;
      if (collectionFilter.length) {
        const tag = p.limitedEdition ? "One of One" : "Core Collection";
        if (!collectionFilter.includes(tag)) return false;
      }
      if (priceFilter.length) {
        const band = PRICE_BANDS.find((b) => b.test(p.price));
        if (!band || !priceFilter.includes(band.label)) return false;
      }
      return true;
    });
  }, [categoryFilter, materialFilter, stoneFilter, availabilityFilter, collectionFilter, priceFilter]);

  const activeCount =
    categoryFilter.length + materialFilter.length + stoneFilter.length + availabilityFilter.length + collectionFilter.length + priceFilter.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl">The full collection</h1>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-ink/10 pb-4">
        <button
          onClick={() => setCategoryFilter([])}
          className={`px-4 py-2 text-sm ${categoryFilter.length === 0 ? "bg-ink text-ivory" : "text-ink/70 hover:text-ink"}`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategoryFilter(categoryFilter.length === 1 && categoryFilter[0] === c ? [] : [c])}
            className={`px-4 py-2 text-sm ${
              categoryFilter.length === 1 && categoryFilter[0] === c ? "bg-ink text-ivory" : "text-ink/70 hover:text-ink"
            }`}
          >
            {c}
          </button>
        ))}
        <button
          onClick={() => setDrawerOpen(true)}
          className="ml-auto flex items-center gap-2 border border-ink/25 px-4 py-2 text-sm hover:border-ink"
        >
          Filters{activeCount ? ` (${activeCount})` : ""}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <FilterGroups
            materialFilter={materialFilter}
            setMaterialFilter={setMaterialFilter}
            stoneFilter={stoneFilter}
            setStoneFilter={setStoneFilter}
            availabilityFilter={availabilityFilter}
            setAvailabilityFilter={setAvailabilityFilter}
            collectionFilter={collectionFilter}
            setCollectionFilter={setCollectionFilter}
            priceFilter={priceFilter}
            setPriceFilter={setPriceFilter}
          />
        </aside>

        <div>
          <p className="mb-4 text-sm text-ink/50">{filtered.length} pieces</p>
          {filtered.length ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-ink/60">No pieces match those filters yet.</p>
          )}
        </div>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="flex-1 bg-ink/40" onClick={() => setDrawerOpen(false)} />
          <div className="w-[85%] max-w-sm overflow-y-auto bg-ivory p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xl">Filters</h2>
              <button onClick={() => setDrawerOpen(false)} className="text-2xl leading-none">
                ×
              </button>
            </div>
            <FilterGroups
              materialFilter={materialFilter}
              setMaterialFilter={setMaterialFilter}
              stoneFilter={stoneFilter}
              setStoneFilter={setStoneFilter}
              availabilityFilter={availabilityFilter}
              setAvailabilityFilter={setAvailabilityFilter}
              collectionFilter={collectionFilter}
              setCollectionFilter={setCollectionFilter}
              priceFilter={priceFilter}
              setPriceFilter={setPriceFilter}
            />
            <button
              onClick={() => setDrawerOpen(false)}
              className="mt-8 w-full bg-ink py-3.5 text-sm uppercase tracking-[0.14em] text-ivory"
            >
              Show {filtered.length} pieces
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FilterGroups(props: {
  materialFilter: string[];
  setMaterialFilter: (v: string[]) => void;
  stoneFilter: string[];
  setStoneFilter: (v: string[]) => void;
  availabilityFilter: string[];
  setAvailabilityFilter: (v: string[]) => void;
  collectionFilter: string[];
  setCollectionFilter: (v: string[]) => void;
  priceFilter: string[];
  setPriceFilter: (v: string[]) => void;
}) {
  return (
    <div className="space-y-8">
      <FilterGroup
        title="Material"
        options={[...MATERIALS]}
        selected={props.materialFilter}
        onToggle={(v) => props.setMaterialFilter(toggle(props.materialFilter, v))}
      />
      <FilterGroup
        title="Stone"
        options={[...STONES]}
        selected={props.stoneFilter}
        onToggle={(v) => props.setStoneFilter(toggle(props.stoneFilter, v))}
      />
      <FilterGroup
        title="Price"
        options={PRICE_BANDS.map((b) => b.label)}
        selected={props.priceFilter}
        onToggle={(v) => props.setPriceFilter(toggle(props.priceFilter, v))}
      />
      <FilterGroup
        title="Availability"
        options={[...AVAILABILITY]}
        selected={props.availabilityFilter}
        onToggle={(v) => props.setAvailabilityFilter(toggle(props.availabilityFilter, v))}
      />
      <FilterGroup
        title="Collection"
        options={[...COLLECTIONS]}
        selected={props.collectionFilter}
        onToggle={(v) => props.setCollectionFilter(toggle(props.collectionFilter, v))}
      />
    </div>
  );
}

function FilterGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-xs uppercase tracking-[0.14em] text-ink/50">{title}</legend>
      <div className="mt-3 space-y-2.5">
        {options.map((opt) => (
          <label key={opt} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink/80">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => onToggle(opt)}
              className="h-4 w-4 accent-[#b0602f]"
            />
            {opt}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
