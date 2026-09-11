import type { Metadata } from "next";
import Link from "next/link";
import { PAGE_LABELS, type PageKey } from "@/lib/pages";

export const metadata: Metadata = { title: "Pages" };

export default function PagesListPage() {
  const keys = Object.keys(PAGE_LABELS) as PageKey[];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--admin-text)]">Pages</h1>
      <p className="mt-1 text-sm text-[var(--admin-text-muted)]">Edit copy and images for each page. Changes go live immediately.</p>

      <div className="mt-6 max-w-md overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm">
        <ul className="divide-y divide-[var(--admin-border)]">
          {keys.map((key) => (
            <li key={key}>
              <Link
                href={`/admin/pages/${key}`}
                className="flex items-center justify-between px-5 py-3 text-sm text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)] hover:text-[var(--admin-text)]"
              >
                <span className="flex items-center gap-2">
                  {PAGE_LABELS[key]}
                  <span className="rounded-full bg-[var(--admin-success-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--admin-success)]">Published</span>
                </span>
                <span className="text-[var(--admin-text-faint)]">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
