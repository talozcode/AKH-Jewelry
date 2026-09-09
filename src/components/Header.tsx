"use client";

import Link from "next/link";
import { useState } from "react";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/bespoke", label: "Bespoke" },
  { href: "/story", label: "Our Story" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-ivory/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-script text-3xl">
          akh.
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm tracking-wide text-ink/80 transition hover:text-copper"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            aria-label="Search"
            className="hidden text-ink/70 transition hover:text-copper sm:block"
          >
            <SearchIcon />
          </button>
          <select
            aria-label="Currency"
            defaultValue="ILS"
            className="hidden rounded-none border-0 bg-transparent text-xs tracking-wide text-ink/60 focus:outline-none lg:block"
          >
            <option value="ILS">₪ ILS</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
          </select>
          <button aria-label="Account" className="hidden text-ink/70 transition hover:text-copper sm:block">
            <UserIcon />
          </button>
          <Link href="/cart" aria-label="Cart" className="relative text-ink/70 transition hover:text-copper">
            <BagIcon />
          </Link>
          <button
            aria-label="Open menu"
            className="text-ink/80 md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-ink/10 bg-ivory md:hidden">
          <nav className="flex flex-col px-4 py-4">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-ink/5 py-3 text-base tracking-wide"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/story" onClick={() => setOpen(false)} className="border-b border-ink/5 py-3 text-base tracking-wide">
              Search
            </Link>
            <Link href="/cart" onClick={() => setOpen(false)} className="py-3 text-base tracking-wide">
              Cart
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" strokeLinecap="round" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 8h12l1 12.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20.5L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
      )}
    </svg>
  );
}
