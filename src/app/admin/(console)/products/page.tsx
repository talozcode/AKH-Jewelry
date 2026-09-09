import Link from "next/link";
import { getAllProductsForAdmin } from "@/lib/products";
import { wixImg } from "@/lib/wixImage";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAllProductsForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Products</h1>
        <Link href="/admin/products/new" className="bg-charcoal px-5 py-2.5 text-sm text-ivory transition hover:bg-charcoal-soft">
          + New product
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-ink/15 text-left text-xs uppercase tracking-[0.06em] text-ink/50">
              <th className="py-2 pr-3">Photo</th>
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Category</th>
              <th className="py-2 pr-3">Price</th>
              <th className="py-2 pr-3">Availability</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-ink/5">
                <td className="py-2 pr-3">
                  {p.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={wixImg(p.images[0], 80, 100)} alt="" className="h-12 w-10 object-cover" />
                  ) : (
                    <div className="h-12 w-10 bg-ivory-deep" />
                  )}
                </td>
                <td className="py-2 pr-3">
                  <Link href={`/admin/products/${p.id}`} className="hover:underline">
                    {p.name}
                  </Link>
                  {p.isHero ? <span className="ml-2 text-xs text-brass">hero</span> : null}
                  {p.isFeatured ? <span className="ml-2 text-xs text-copper">featured</span> : null}
                </td>
                <td className="py-2 pr-3 text-ink/70">{p.category}</td>
                <td className="py-2 pr-3 text-ink/70">
                  {p.currency === "ILS" ? "₪" : "$"}
                  {p.price.toLocaleString()}
                </td>
                <td className="py-2 pr-3 text-ink/70">{p.availability}</td>
                <td className="py-2 pr-3">
                  {p.isPublished ? (
                    <span className="text-xs text-green-700">Published</span>
                  ) : (
                    <span className="text-xs text-ink/40">Draft</span>
                  )}
                </td>
                <td className="py-2 pr-3 text-right">
                  <Link href={`/admin/products/${p.id}`} className="text-ink/60 underline underline-offset-2 hover:text-ink">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 ? <p className="py-8 text-center text-ink/50">No products yet.</p> : null}
      </div>
    </div>
  );
}
