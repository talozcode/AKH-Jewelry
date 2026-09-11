"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Collection } from "@/lib/collections";
import type { Product } from "@/lib/types";
import type { MediaAsset } from "@/lib/media";
import { MediaPicker } from "../_components/MediaPicker";
import { ProductPicker } from "./ProductPicker";
import { createCollectionAction, deleteCollectionAction, updateCollectionAction } from "./actions";

const EMPTY: Omit<Collection, "id"> = {
  slug: "",
  name: "",
  tagline: "",
  intro: "",
  heroImageUrl: "",
  heroImageAlt: "",
  story: "",
  productSlugs: [],
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

const inputClass =
  "mt-1 w-full rounded-md border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text)] outline-none focus:border-[var(--admin-accent-soft)] focus:ring-1 focus:ring-[var(--admin-accent-soft)]";
const textareaClass = inputClass + " min-h-24";

function field(label: string, input: React.ReactNode, hint?: string) {
  return (
    <label className="block">
      <span className="block text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">{label}</span>
      {input}
      {hint ? <span className="mt-1 block text-xs text-[var(--admin-text-faint)]">{hint}</span> : null}
    </label>
  );
}

export function CollectionForm({
  collection,
  allProducts,
  mediaAssets,
}: {
  collection?: Collection;
  allProducts: Product[];
  mediaAssets: MediaAsset[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<Omit<Collection, "id">>(collection ?? EMPTY);
  const [slugTouched, setSlugTouched] = useState(Boolean(collection));
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
      const result = collection?.id ? await updateCollectionAction(collection.id, form) : await createCollectionAction(form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/admin/collections");
      router.refresh();
    });
  }

  function handleDelete() {
    if (!collection?.id) return;
    if (!confirm(`Delete "${collection.name}"? This can't be undone.`)) return;
    startDeleting(async () => {
      const result = await deleteCollectionAction(collection.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/admin/collections");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
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
          "/collections/" + (form.slug || "…")
        )}
      </section>

      {field("Tagline", <input className={inputClass} value={form.tagline} required onChange={(e) => set("tagline", e.target.value)} />)}
      {field("Intro", <textarea className={textareaClass} value={form.intro} required onChange={(e) => set("intro", e.target.value)} />)}
      <MediaPicker label="Hero photo" value={form.heroImageUrl} onChange={(url) => set("heroImageUrl", url)} assets={mediaAssets} />
      {field("Hero photo alt text", <input className={inputClass} value={form.heroImageAlt} onChange={(e) => set("heroImageAlt", e.target.value)} />)}
      {field("Story", <textarea className={textareaClass} value={form.story} required onChange={(e) => set("story", e.target.value)} />)}

      <section>
        <span className="block text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">Products</span>
        <div className="mt-2">
          <ProductPicker allProducts={allProducts} slugs={form.productSlugs} onChange={(slugs) => set("productSlugs", slugs)} />
        </div>
      </section>

      <label className="flex items-center gap-2 text-sm text-[var(--admin-text)]">
        <input type="checkbox" checked={form.isPublished} onChange={(e) => set("isPublished", e.target.checked)} />
        Published (visible on the live site)
      </label>

      <div className="flex items-center justify-between border-t border-[var(--admin-border)] pt-6">
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-[var(--admin-accent)] px-6 py-2.5 text-sm font-medium text-[var(--admin-accent-text)] transition hover:bg-[var(--admin-accent-hover)] disabled:opacity-50"
          >
            {saving ? "Saving…" : collection ? "Save changes" : "Create collection"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/collections")}
            className="rounded-md border border-[var(--admin-border-strong)] px-6 py-2.5 text-sm text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)]"
          >
            Cancel
          </button>
        </div>
        {collection ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm text-[var(--admin-danger)] underline underline-offset-2 hover:no-underline disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete collection"}
          </button>
        ) : null}
      </div>
    </form>
  );
}
