import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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

async function signOut() {
  "use server";
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();

  return (
    <div className="flex min-h-dvh bg-slate-50 font-sans text-slate-900">
      <Sidebar signOutAction={signOut} />
      <main className="flex-1 overflow-x-hidden px-8 py-10 sm:px-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
