import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, tokenMatches } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

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
    maxAge: 60 * 60 * 24 * 30,
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
    <main className="grid min-h-dvh place-items-center bg-slate-900 px-6 font-sans">
      <form action={signIn} className="w-full max-w-sm rounded-lg border border-slate-800 bg-slate-950/40 p-8 shadow-xl">
        <p className="font-script text-3xl text-white">akh.</p>
        <h1 className="mt-6 text-xl font-semibold text-white">Studio admin</h1>
        <p className="mt-2 text-sm text-slate-400">
          Products, reservations and settings for akhjewelry.com. Not public.
        </p>

        <input
          type="password"
          name="token"
          placeholder="Admin password"
          autoFocus
          aria-label="Admin password"
          className="mt-6 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
        />
        {error ? <p className="mt-2 text-sm text-red-400">That password wasn&apos;t accepted. Check for a trailing space.</p> : null}
        <button
          type="submit"
          className="mt-3 w-full rounded-md bg-white px-3 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
        >
          Sign in
        </button>
      </form>
    </main>
  );
}
