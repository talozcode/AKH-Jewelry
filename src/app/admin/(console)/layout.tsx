import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdminPage, ADMIN_COOKIE } from "@/lib/admin/auth";
import { Sidebar } from "./Sidebar";

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
