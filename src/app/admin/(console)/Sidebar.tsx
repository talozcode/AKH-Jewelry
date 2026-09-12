"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  { href: "/admin/help", label: "Help" },
];

/**
 * Below `lg`, the full-height fixed-width sidebar this admin used to
 * always render would eat most of a phone's screen width (a 240px
 * sidebar leaves ~135px of content on a 375px viewport). Below `lg` this
 * now renders a top bar with a hamburger toggle instead, and the nav
 * itself becomes a fixed off-canvas drawer (slides in over a backdrop,
 * closes on backdrop tap or on navigating). At `lg` and above it's the
 * original always-visible static sidebar, unchanged.
 */
export function Sidebar({ signOutAction }: { signOutAction: () => Promise<void> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Closes the drawer automatically after following a nav link, so it
  // doesn't stay open covering the page just navigated to. Adjusting
  // state during render (React's own documented pattern for "reset state
  // when a prop changes") rather than useState+useEffect, which would
  // cause an extra render pass for what's otherwise a synchronous update.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-[var(--admin-sidebar-border)] bg-[var(--admin-sidebar-bg)] px-4 py-3 lg:hidden">
        <span className="font-script text-xl text-[var(--admin-sidebar-active-text)]">akh.</span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-md p-2 text-[var(--admin-sidebar-text)] hover:bg-[var(--admin-sidebar-active-bg)]/60 hover:text-[var(--admin-sidebar-active-text)]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 -translate-x-full flex-col bg-[var(--admin-sidebar-bg)] text-[var(--admin-sidebar-text)] transition-transform duration-200 lg:static lg:z-auto lg:w-60 lg:shrink-0 lg:translate-x-0 ${
          open ? "translate-x-0" : ""
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div>
            <span className="font-script text-2xl text-[var(--admin-sidebar-active-text)]">akh.</span>
            <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-[var(--admin-sidebar-text-muted)]">Studio Admin</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="rounded-md p-1 text-[var(--admin-sidebar-text)] hover:text-[var(--admin-sidebar-active-text)] lg:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3">
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
    </>
  );
}
