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
    <main className="grid min-h-dvh place-items-center bg-ivory px-6 font-sans text-ink">
      <form action={signIn} className="w-full max-w-sm">
        <p className="font-script text-3xl">akh.</p>
        <h1 className="mt-6 text-xl font-medium">Studio admin</h1>
        <p className="mt-2 text-sm text-ink/60">
          Products, reservations and settings for akhjewelry.com. Not public.
        </p>

        <input
          type="password"
          name="token"
          placeholder="Admin password"
          autoFocus
          aria-label="Admin password"
          className="mt-6 w-full border border-ink/25 bg-ivory px-3 py-2.5 text-sm outline-none focus:border-ink"
        />
        {error ? (
          <p className="mt-2 text-sm text-red-700">That password wasn&apos;t accepted. Check for a trailing space.</p>
        ) : null}
        <button type="submit" className="mt-3 w-full bg-charcoal px-3 py-2.5 text-sm text-ivory transition hover:bg-charcoal-soft">
          Sign in
        </button>
      </form>
    </main>
  );
}
