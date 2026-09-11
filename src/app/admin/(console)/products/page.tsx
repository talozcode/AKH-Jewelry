import type { Metadata } from "next";
import Link from "next/link";
import { getAllProductsForAdmin } from "@/lib/products";
import { wixImg } from "@/lib/wixImage";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const products = await getAllProductsForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--admin-text)]">Products</h1>
          <p className="mt-1 text-sm text-[var(--admin-text-muted)]">{products.length} total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-md bg-[var(--admin-accent)] px-5 py-2.5 text-sm font-medium text-[var(--admin-accent-text)] transition hover:bg-[var(--admin-accent-hover)]"
        >
          + New product
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-surface-2)] text-left text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
                <th className="py-3 pl-5 pr-3">Photo</th>
                <th className="py-3 pr-3">Name</th>
                <th className="py-3 pr-3">Category</th>
                <th className="py-3 pr-3">Price</th>
                <th className="py-3 pr-3">Availability</th>
                <th className="py-3 pr-3">Status</th>
                <th className="py-3 pr-5"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-[var(--admin-border)] last:border-0 hover:bg-[var(--admin-surface-2)]/60">
                  <td className="py-2 pl-5 pr-3">
                    {p.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={wixImg(p.images[0], 80, 100)} alt="" className="h-12 w-10 rounded object-cover" />
                    ) : (
                      <div className="h-12 w-10 rounded bg-[var(--admin-surface-2)]" />
                    )}
                  </td>
                  <td className="py-2 pr-3">
                    <Link href={`/admin/products/${p.id}`} className="font-medium text-[var(--admin-text)] hover:underline">
                      {p.name}
                    </Link>
                    {p.isHero ? (
                      <span className="ml-2 rounded-full bg-[var(--admin-warning-bg)] px-2 py-0.5 text-xs font-medium text-[var(--admin-warning)]">hero</span>
                    ) : null}
                    {p.isFeatured ? (
                      <span className="ml-2 rounded-full bg-[var(--admin-surface-2)] px-2 py-0.5 text-xs font-medium text-[var(--admin-accent-soft)]">featured</span>
                    ) : null}
                  </td>
                  <td className="py-2 pr-3 text-[var(--admin-text-muted)]">{p.category}</td>
                  <td className="py-2 pr-3 text-[var(--admin-text-muted)]">
                    {p.currency === "ILS" ? "₪" : "$"}
                    {p.price.toLocaleString()}
                  </td>
                  <td className="py-2 pr-3 text-[var(--admin-text-muted)]">{p.availability}</td>
                  <td className="py-2 pr-3">
                    {p.isPublished ? (
                      <span className="rounded-full bg-[var(--admin-success-bg)] px-2 py-0.5 text-xs font-medium text-[var(--admin-success)]">Published</span>
                    ) : (
                      <span className="rounded-full bg-[var(--admin-surface-2)] px-2 py-0.5 text-xs font-medium text-[var(--admin-text-muted)]">Draft</span>
                    )}
                  </td>
                  <td className="py-2 pr-5 text-right">
                    <Link href={`/admin/products/${p.id}`} className="text-sm font-medium text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 ? <p className="py-8 text-center text-[var(--admin-text-faint)]">No products yet.</p> : null}
        </div>
      </div>
    </div>
  );
}
