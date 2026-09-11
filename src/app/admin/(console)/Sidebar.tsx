"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/privacy", label: "Data requests" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/site-settings", label: "Settings" },
];

export function Sidebar({ signOutAction }: { signOutAction: () => Promise<void> }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-[var(--admin-sidebar-bg)] text-[var(--admin-sidebar-text)]">
      <div className="px-6 py-6">
        <span className="font-script text-2xl text-[var(--admin-sidebar-active-text)]">akh.</span>
        <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-[var(--admin-sidebar-text-muted)]">Studio Admin</p>
      </div>

      <nav className="flex-1 px-3">
        {NAV.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-0.5 flex items-center rounded-md px-3 py-2 text-sm transition ${
                active
                  ? "bg-[var(--admin-sidebar-active-bg)] font-medium text-[var(--admin-sidebar-active-text)]"
                  : "text-[var(--admin-sidebar-text)] hover:bg-[var(--admin-sidebar-active-bg)]/60 hover:text-[var(--admin-sidebar-active-text)]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--admin-sidebar-border)] px-3 py-2">
        <ThemeToggle />
      </div>

      <div className="border-t border-[var(--admin-sidebar-border)] px-3 py-4 text-sm">
        <Link
          href="/"
          target="_blank"
          className="block rounded-md px-3 py-2 text-[var(--admin-sidebar-text)] hover:bg-[var(--admin-sidebar-active-bg)]/60 hover:text-[var(--admin-sidebar-active-text)]"
        >
          View site ↗
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="block w-full rounded-md px-3 py-2 text-left text-[var(--admin-sidebar-text)] hover:bg-[var(--admin-sidebar-active-bg)]/60 hover:text-[var(--admin-sidebar-active-text)]"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
