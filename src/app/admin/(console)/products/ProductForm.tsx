"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Availability, Category, Product } from "@/lib/types";
import { ImageManager } from "./ImageManager";
import { createProductAction, deleteProductAction, updateProductAction } from "./actions";

const CATEGORIES: Category[] = ["Rings", "Necklaces", "Bracelets"];
const AVAILABILITIES: Availability[] = ["In Stock", "Made to Order", "Out of Stock"];

const EMPTY: Omit<Product, "id"> = {
  slug: "",
  name: "",
  category: "Rings",
  price: 0,
  currency: "ILS",
  material: "",
  stone: "",
  measurements: "",
  weight: "",
  availableSizes: [],
  availability: "In Stock",
  stockQuantity: null,
  dispatch: "",
  limitedEdition: "",
  images: [],
  tagline: "",
  description: "",
  story: "",
  craftsmanship: "",
  care: "",
  isFeatured: false,
  isHero: false,
  isPublished: true,
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function field(label: string, input: React.ReactNode, hint?: string) {
  return (
    <label className="block">
      <span className="block text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">{label}</span>
      {input}
      {hint ? <span className="mt-1 block text-xs text-[var(--admin-text-faint)]">{hint}</span> : null}
    </label>
  );
}

const inputClass =
  "mt-1 w-full rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text)] outline-none focus:border-[var(--admin-accent-soft)] focus:ring-1 focus:ring-[var(--admin-accent-soft)]";
const textareaClass = inputClass + " min-h-24";

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [form, setForm] = useState<Omit<Product, "id">>(product ?? EMPTY);
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [saving, startSaving] = useTransition();
  const [deleting, startDeleting] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startSaving(async () => {
      const payload = {
        ...form,
        stone: form.stone || undefined,
        weight: form.weight || undefined,
        limitedEdition: form.limitedEdition || undefined,
        availableSizes: form.availableSizes && form.availableSizes.length > 0 ? form.availableSizes : undefined,
      };
      const result = product?.id
        ? await updateProductAction(product.id, payload)
        : await createProductAction(payload);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    });
  }

  function handleDelete() {
    if (!product?.id) return;
    if (!confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    startDeleting(async () => {
      const result = await deleteProductAction(product.id!);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      {error ? <p className="rounded-md border border-[var(--admin-danger-border)] bg-[var(--admin-danger-bg)] px-3 py-2 text-sm text-[var(--admin-danger)]">{error}</p> : null}

      <section className="grid grid-cols-2 gap-4">
        {field(
          "Name",
          <input
            className={inputClass}
            value={form.name}
            required
            onChange={(e) => {
              const name = e.target.value;
              set("name", name);
              if (!slugTouched) set("slug", slugify(name));
            }}
          />
        )}
        {field(
          "Slug (URL)",
          <input
            className={inputClass}
            value={form.slug}
            required
            onChange={(e) => {
              setSlugTouched(true);
              set("slug", e.target.value);
            }}
          />,
          "/product/" + (form.slug || "…")
        )}
        {field(
          "Category",
          <select className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value as Category)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
        {field(
          "Availability",
          <select
            className={inputClass}
            value={form.availability}
            onChange={(e) => {
              const availability = e.target.value as Availability;
              set("availability", availability);
              // Not tracked unless In Stock - clear it so switching away
              // never leaves a stale count sitting unused underneath.
              if (availability !== "In Stock") set("stockQuantity", null);
            }}
          >
            {AVAILABILITIES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        )}
        {form.availability === "In Stock"
          ? field(
              "Stock quantity (optional)",
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.stockQuantity ?? ""}
                onChange={(e) => set("stockQuantity", e.target.value === "" ? null : Number(e.target.value))}
              />,
              "Leave blank for a one-of-one piece (flips straight to Out of Stock when sold). Set a number to track a real count."
            )
          : null}
        {field(
          "Price",
          <input
            type="number"
            min={0}
            className={inputClass}
            value={form.price}
            required
            onChange={(e) => set("price", Number(e.target.value))}
          />
        )}
        {field(
          "Currency",
          <select className={inputClass} value={form.currency} onChange={(e) => set("currency", e.target.value as "ILS" | "USD")}>
            <option value="ILS">ILS</option>
            <option value="USD">USD</option>
          </select>
        )}
        {field("Material", <input className={inputClass} value={form.material} required onChange={(e) => set("material", e.target.value)} />)}
        {field("Stone (optional)", <input className={inputClass} value={form.stone ?? ""} onChange={(e) => set("stone", e.target.value)} />)}
        {field(
          "Measurements",
          <input className={inputClass} value={form.measurements} required onChange={(e) => set("measurements", e.target.value)} />
        )}
        {field("Weight (optional)", <input className={inputClass} value={form.weight ?? ""} onChange={(e) => set("weight", e.target.value)} />)}
        {field(
          "Available sizes (comma-separated, optional)",
          <input
            className={inputClass}
            value={(form.availableSizes ?? []).join(", ")}
            onChange={(e) =>
              set(
                "availableSizes",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
          />
        )}
        {field("Dispatch note", <input className={inputClass} value={form.dispatch} required onChange={(e) => set("dispatch", e.target.value)} />)}
        {field(
          "Limited edition note (optional)",
          <input className={inputClass} value={form.limitedEdition ?? ""} onChange={(e) => set("limitedEdition", e.target.value)} />
        )}
      </section>

      <section>
        <span className="block text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">Photos</span>
        <div className="mt-2">
          <ImageManager images={form.images} onChange={(images) => set("images", images)} />
        </div>
      </section>

      <section className="space-y-4">
        {field("Tagline", <input className={inputClass} value={form.tagline} required onChange={(e) => set("tagline", e.target.value)} />)}
        {field(
          "Description",
          <textarea className={textareaClass} value={form.description} required onChange={(e) => set("description", e.target.value)} />
        )}
        {field("Story", <textarea className={textareaClass} value={form.story} required onChange={(e) => set("story", e.target.value)} />)}
        {field(
          "Craftsmanship",
          <textarea className={textareaClass} value={form.craftsmanship} required onChange={(e) => set("craftsmanship", e.target.value)} />
        )}
        {field("Care", <textarea className={textareaClass} value={form.care} required onChange={(e) => set("care", e.target.value)} />)}
      </section>

      <section className="flex flex-wrap gap-6 border-t border-[var(--admin-border)] pt-6">
        <label className="flex items-center gap-2 text-sm text-[var(--admin-text)]">
          <input type="checkbox" checked={form.isPublished} onChange={(e) => set("isPublished", e.target.checked)} />
          Published (visible on the live site)
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--admin-text)]">
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} />
          Featured on homepage
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--admin-text)]">
          <input type="checkbox" checked={form.isHero} onChange={(e) => set("isHero", e.target.checked)} />
          Homepage hero image
        </label>
      </section>

      <div className="flex items-center justify-between border-t border-[var(--admin-border)] pt-6">
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-[var(--admin-accent)] px-6 py-2.5 text-sm font-medium text-[var(--admin-accent-text)] transition hover:bg-[var(--admin-accent-hover)] disabled:opacity-50"
          >
            {saving ? "Saving…" : product ? "Save changes" : "Create product"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="rounded-md border border-[var(--admin-border-strong)] px-6 py-2.5 text-sm text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)]"
          >
            Cancel
          </button>
        </div>
        {product ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm text-[var(--admin-danger)] underline underline-offset-2 hover:no-underline disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete product"}
          </button>
        ) : null}
      </div>
    </form>
  );
}
