import type { Metadata } from "next";
import Link from "next/link";
import { PAGE_LABELS, type PageKey } from "@/lib/pages";

export const metadata: Metadata = { title: "Pages" };

export default function PagesListPage() {
  const keys = Object.keys(PAGE_LABELS) as PageKey[];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Pages</h1>
      <p className="mt-1 text-sm text-slate-500">Edit copy and images for each page. Changes go live immediately.</p>

      <div className="mt-6 max-w-md overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <ul className="divide-y divide-slate-100">
          {keys.map((key) => (
            <li key={key}>
              <Link
                href={`/admin/pages/${key}`}
                className="flex items-center justify-between px-5 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              >
                {PAGE_LABELS[key]}
                <span className="text-slate-400">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
