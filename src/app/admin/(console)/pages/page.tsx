import Link from "next/link";
import { PAGE_LABELS, type PageKey } from "@/lib/pages";

export default function PagesListPage() {
  const keys = Object.keys(PAGE_LABELS) as PageKey[];

  return (
    <div>
      <h1 className="text-2xl font-medium">Pages</h1>
      <p className="mt-1 text-sm text-ink/60">Edit copy and images for each page. Changes go live immediately.</p>

      <ul className="mt-8 max-w-md divide-y divide-ink/10 border-t border-b border-ink/10">
        {keys.map((key) => (
          <li key={key}>
            <Link href={`/admin/pages/${key}`} className="flex items-center justify-between py-3 text-sm hover:text-copper">
              {PAGE_LABELS[key]}
              <span className="text-ink/40">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
