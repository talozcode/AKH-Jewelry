import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Script from "next/script";
import { ADMIN_COOKIE, tokenMatches } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  // absolute: this page sits outside the (console) group, so it only
  // inherits the ROOT layout's "%s | AKH Jewelry" template - without
  // `absolute` it would double up as "Sign in · AKH Admin | AKH Jewelry".
  title: { absolute: "Sign in · AKH Admin" },
  robots: { index: false, follow: false },
};

// Same no-FOUC pattern as (console)/layout.tsx: this page sits outside
// that layout (pre-authentication), so it needs its own copy rather than
// inheriting the console's script.
const THEME_INIT_SCRIPT = `
  try {
    var t = localStorage.getItem("akh-admin-theme");
    document.documentElement.setAttribute("data-admin-theme", t === "dark" ? "dark" : "light");
  } catch (e) {
    document.documentElement.setAttribute("data-admin-theme", "light");
  }
`;

async function signIn(formData: FormData) {
  "use server";
  const token = String(formData.get("token") ?? "");
  if (!tokenMatches(token)) redirect("/admin/login?error=1");

  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/admin");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <>
      <Script id="admin-theme-init" strategy="beforeInteractive">
        {THEME_INIT_SCRIPT}
      </Script>
      <main className="grid min-h-dvh place-items-center bg-[var(--admin-sidebar-bg)] px-6 font-sans">
        <form
          action={signIn}
          className="w-full max-w-sm rounded-lg border border-[var(--admin-sidebar-border)] bg-[var(--admin-sidebar-active-bg)]/40 p-8 shadow-xl"
        >
          <p className="font-script text-3xl text-[var(--admin-sidebar-active-text)]">akh.</p>
          <h1 className="mt-6 text-xl font-semibold text-[var(--admin-sidebar-active-text)]">Studio admin</h1>
          <p className="mt-2 text-sm text-[var(--admin-sidebar-text)]">
            Products, orders and settings for akhjewelry.com. Not public.
          </p>

          <input
            type="password"
            name="token"
            placeholder="Admin password"
            autoFocus
            aria-label="Admin password"
            className="mt-6 w-full rounded-md border border-[var(--admin-sidebar-border)] bg-[var(--admin-sidebar-bg)] px-3 py-2.5 text-sm text-[var(--admin-sidebar-active-text)] outline-none placeholder:text-[var(--admin-sidebar-text-muted)] focus:border-[var(--admin-brass)] focus:ring-1 focus:ring-[var(--admin-brass)]"
          />
          {error ? <p className="mt-2 text-sm text-[var(--admin-danger)]">That password wasn&apos;t accepted. Check for a trailing space.</p> : null}
          <button
            type="submit"
            className="mt-3 w-full rounded-md bg-[var(--admin-sidebar-active-text)] px-3 py-2.5 text-sm font-medium text-[var(--admin-sidebar-bg)] transition hover:opacity-90"
          >
            Sign in
          </button>
        </form>
      </main>
    </>
  );
}
