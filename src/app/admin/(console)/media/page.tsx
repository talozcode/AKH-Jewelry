import { listMediaAssets } from "@/lib/media";
import { MediaUploader } from "./MediaUploader";
import { MediaItemActions } from "./MediaItemActions";

export const dynamic = "force-dynamic";

export default async function MediaLibraryPage() {
  const assets = await listMediaAssets();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Media</h1>
        <MediaUploader />
      </div>
      <p className="mt-1 text-sm text-ink/60">
        Photography used across the homepage, story and bespoke pages. Pick one of these from the media
        picker when editing a page or collection.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {assets.map((asset) => (
          <div key={asset.id} className="border border-ink/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset.url} alt={asset.filename} className="aspect-square w-full object-cover" />
            <p className="truncate px-2 pt-2 text-xs text-ink/60">{asset.filename}</p>
            <MediaItemActions id={asset.id} url={asset.url} filename={asset.filename} />
          </div>
        ))}
      </div>
      {assets.length === 0 ? <p className="mt-12 text-center text-ink/50">No images uploaded yet.</p> : null}
    </div>
  );
}
