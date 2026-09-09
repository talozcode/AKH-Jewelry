import type { Metadata } from "next";
import Link from "next/link";
import { getAllCollectionsForAdmin } from "@/lib/collections";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Collections" };

export default async function AdminCollectionsPage() {
  const collections = await getAllCollectionsForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Collections</h1>
          <p className="mt-1 text-sm text-slate-500">{collections.length} total</p>
        </div>
        <Link
          href="/admin/collections/new"
          className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          + New collection
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="py-3 pl-5 pr-3">Name</th>
                <th className="py-3 pr-3">Products</th>
                <th className="py-3 pr-3">Status</th>
                <th className="py-3 pr-5"></th>
              </tr>
            </thead>
            <tbody>
              {collections.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                  <td className="py-2 pl-5 pr-3">
                    <Link href={`/admin/collections/${c.id}`} className="font-medium text-slate-900 hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="py-2 pr-3 text-slate-600">{c.productSlugs.length}</td>
                  <td className="py-2 pr-3">
                    {c.isPublished ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Published</span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">Draft</span>
                    )}
                  </td>
                  <td className="py-2 pr-5 text-right">
                    <Link href={`/admin/collections/${c.id}`} className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {collections.length === 0 ? <p className="py-8 text-center text-slate-400">No collections yet.</p> : null}
        </div>
      </div>
    </div>
  );
}
