import type { Metadata } from "next";
import { listMediaAssets } from "@/lib/media";
import { MediaUploader } from "./MediaUploader";
import { MediaItemActions } from "./MediaItemActions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Media" };

export default async function MediaLibraryPage() {
  const assets = await listMediaAssets();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--admin-text)]">Media</h1>
          <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
            Photography used across the homepage, story and bespoke pages. Pick one of these from the
            media picker when editing a page or collection.
          </p>
        </div>
        <MediaUploader />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {assets.map((asset) => (
          <div key={asset.id} className="overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset.url} alt={asset.filename} className="aspect-square w-full object-cover" />
            <p className="truncate px-2 pt-2 text-xs text-[var(--admin-text-muted)]">{asset.filename}</p>
            <MediaItemActions id={asset.id} url={asset.url} filename={asset.filename} />
          </div>
        ))}
      </div>
      {assets.length === 0 ? <p className="mt-12 text-center text-[var(--admin-text-faint)]">No images uploaded yet.</p> : null}
    </div>
  );
}
