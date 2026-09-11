import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Script from "next/script";
import { requireAdminPage, ADMIN_COOKIE } from "@/lib/admin/auth";
import { Sidebar } from "./Sidebar";

export const metadata: Metadata = {
  // `absolute` (not `default`) so this doesn't also get wrapped by the root
  // layout's "%s | AKH Jewelry" template - the admin console should never
  // show the storefront's brand suffix in its tab title.
  title: { template: "%s · AKH Admin", absolute: "Studio Admin" },
  description: "AKH Jewelry studio admin.",
  robots: { index: false, follow: false },
};

// Applies the saved admin theme to <html> before the console's first paint,
// so there's no flash of the wrong theme (Sidebar's ThemeToggle reads this
// same attribute back once it hydrates). next/script's beforeInteractive
// strategy, not a plain <script> tag: a raw <script> in a Server
// Component's output only executes when the browser's own HTML parser
// streams it as part of the initial document, and React warns ("Scripts
// inside React components are never executed when rendering on the
// client") the moment this tree is ever reconciled on the client instead
// - beforeInteractive is Next's documented mechanism for exactly this
// "must run before hydration" case, injected into <head> regardless of
// where it's declared.
const THEME_INIT_SCRIPT = `
  try {
    var t = localStorage.getItem("akh-admin-theme");
    document.documentElement.setAttribute("data-admin-theme", t === "dark" ? "dark" : "light");
  } catch (e) {
    document.documentElement.setAttribute("data-admin-theme", "light");
  }
`;

async function signOut() {
  "use server";
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();

  return (
    <>
      <Script id="admin-theme-init" strategy="beforeInteractive">
        {THEME_INIT_SCRIPT}
      </Script>
      <div className="flex min-h-dvh bg-[var(--admin-bg)] font-sans text-[var(--admin-text)]">
        <Sidebar signOutAction={signOut} />
        <main className="flex-1 overflow-x-hidden px-8 py-10 sm:px-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </>
  );
}
