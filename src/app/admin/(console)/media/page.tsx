import { listMediaAssets } from "@/lib/media";
import { MediaUploader } from "./MediaUploader";
import { MediaItemActions } from "./MediaItemActions";

export const dynamic = "force-dynamic";

export default async function MediaLibraryPage() {
  const assets = await listMediaAssets();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Media</h1>
          <p className="mt-1 text-sm text-slate-500">
            Photography used across the homepage, story and bespoke pages. Pick one of these from the
            media picker when editing a page or collection.
          </p>
        </div>
        <MediaUploader />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {assets.map((asset) => (
          <div key={asset.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset.url} alt={asset.filename} className="aspect-square w-full object-cover" />
            <p className="truncate px-2 pt-2 text-xs text-slate-500">{asset.filename}</p>
            <MediaItemActions id={asset.id} url={asset.url} filename={asset.filename} />
          </div>
        ))}
      </div>
      {assets.length === 0 ? <p className="mt-12 text-center text-slate-400">No images uploaded yet.</p> : null}
    </div>
  );
}
