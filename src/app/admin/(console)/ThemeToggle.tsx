"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "akh-admin-theme";

// Minimal pub-sub so useSyncExternalStore actually re-renders when the
// theme changes. There's exactly one real writer (setTheme, called from
// toggle() below) and it must notify every subscribed listener itself -
// useSyncExternalStore has no way to know the DOM attribute it reads
// changed unless something calls back into it.
const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function getSnapshot(): "light" | "dark" {
  return document.documentElement.getAttribute("data-admin-theme") === "dark" ? "dark" : "light";
}

function getServerSnapshot(): "light" | "dark" {
  return "light";
}

function setTheme(next: "light" | "dark") {
  document.documentElement.setAttribute("data-admin-theme", next);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Private-browsing/storage-blocked: the toggle still works for this
    // page view, it just won't persist to the next one.
  }
  for (const listener of listeners) listener();
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--admin-text-muted)] transition hover:bg-[var(--admin-surface-2)] hover:text-[var(--admin-text)]"
    >
      {theme === "light" ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2.5v2.5M12 19v2.5M4.5 12H2M22 12h-2.5M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" />
        </svg>
      )}
      {theme === "light" ? "Light theme" : "Dark theme"}
    </button>
  );
}
