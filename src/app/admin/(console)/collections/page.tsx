import Link from "next/link";
import { getAllCollectionsForAdmin } from "@/lib/collections";

export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage() {
  const collections = await getAllCollectionsForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Collections</h1>
        <Link href="/admin/collections/new" className="bg-charcoal px-5 py-2.5 text-sm text-ivory transition hover:bg-charcoal-soft">
          + New collection
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-ink/15 text-left text-xs uppercase tracking-[0.06em] text-ink/50">
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Products</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3"></th>
            </tr>
          </thead>
          <tbody>
            {collections.map((c) => (
              <tr key={c.id} className="border-b border-ink/5">
                <td className="py-2 pr-3">
                  <Link href={`/admin/collections/${c.id}`} className="hover:underline">
                    {c.name}
                  </Link>
                </td>
                <td className="py-2 pr-3 text-ink/70">{c.productSlugs.length}</td>
                <td className="py-2 pr-3">
                  {c.isPublished ? <span className="text-xs text-green-700">Published</span> : <span className="text-xs text-ink/40">Draft</span>}
                </td>
                <td className="py-2 pr-3 text-right">
                  <Link href={`/admin/collections/${c.id}`} className="text-ink/60 underline underline-offset-2 hover:text-ink">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {collections.length === 0 ? <p className="py-8 text-center text-ink/50">No collections yet.</p> : null}
      </div>
    </div>
  );
}
