import type { Metadata } from "next";
import Link from "next/link";
import { getPage, PAGE_LABELS, type PageKey } from "@/lib/pages";

export const metadata: Metadata = { title: "Pages" };
export const dynamic = "force-dynamic";

// A "[[" marks an unfilled legal placeholder (e.g. [[LEGAL ENTITY NAME]]),
// see the Terms/Privacy DEFAULTS in src/lib/pages.ts. Flagging it here means
// the owner finds it on this list before a customer finds it on the live
// page. Double brackets can't collide with RichText's [text](url) syntax,
// since that pattern requires an immediately following "(".
function hasUnfilledPlaceholder(content: unknown): boolean {
  return JSON.stringify(content).includes("[[");
}

export default async function PagesListPage() {
  const keys = Object.keys(PAGE_LABELS) as PageKey[];
  const flags = await Promise.all(keys.map((key) => getPage(key).then(hasUnfilledPlaceholder)));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Pages</h1>
      <p className="mt-1 text-sm text-slate-500">Edit copy and images for each page. Changes go live immediately.</p>

      <div className="mt-6 max-w-md overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <ul className="divide-y divide-slate-100">
          {keys.map((key, i) => (
            <li key={key}>
              <Link
                href={`/admin/pages/${key}`}
                className="flex items-center justify-between px-5 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              >
                <span className="flex items-center gap-2">
                  {PAGE_LABELS[key]}
                  {flags[i] ? (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">
                      Unfilled placeholder
                    </span>
                  ) : null}
                </span>
                <span className="text-slate-400">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
