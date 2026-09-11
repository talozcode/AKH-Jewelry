"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/site-settings", label: "Settings" },
];

export function Sidebar({ signOutAction }: { signOutAction: () => Promise<void> }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-slate-900 text-slate-300">
      <div className="px-6 py-6">
        <span className="font-script text-2xl text-white">akh.</span>
        <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-slate-500">Studio Admin</p>
      </div>

      <nav className="flex-1 px-3">
        {NAV.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-0.5 flex items-center rounded-md px-3 py-2 text-sm transition ${
                active ? "bg-slate-800 font-medium text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 px-3 py-4 text-sm">
        <Link href="/" target="_blank" className="block rounded-md px-3 py-2 text-slate-400 hover:bg-slate-800/60 hover:text-white">
          View site ↗
        </Link>
        <form action={signOutAction}>
          <button type="submit" className="block w-full rounded-md px-3 py-2 text-left text-slate-400 hover:bg-slate-800/60 hover:text-white">
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
