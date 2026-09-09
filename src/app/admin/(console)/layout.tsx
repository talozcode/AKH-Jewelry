import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdminPage, ADMIN_COOKIE } from "@/lib/admin/auth";

async function signOut() {
  "use server";
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/reservations", label: "Reservations" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/site-settings", label: "Settings" },
];

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();

  return (
    <div className="min-h-dvh bg-ivory font-sans text-ink">
      <header className="border-b border-ink/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <span className="font-script text-2xl">akh.</span>
            <nav className="flex items-center gap-6 text-sm">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="text-ink/70 hover:text-ink">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" target="_blank" className="text-ink/50 underline underline-offset-2 hover:text-ink">
              View site ↗
            </Link>
            <form action={signOut}>
              <button type="submit" className="text-ink/50 hover:text-ink">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
