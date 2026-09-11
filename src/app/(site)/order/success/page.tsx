import type { Metadata } from "next";
import Link from "next/link";
import { stripeClient } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  // Read directly from Stripe, not from our own `orders` table - the
  // webhook that writes that row is async and may not have run yet by
  // the time the browser lands here. This is independent of that timing.
  let summary: { name: string; amount: number; currency: string; email: string | null } | null = null;
  if (session_id) {
    try {
      const session = await stripeClient().checkout.sessions.retrieve(session_id, {
        expand: ["line_items"],
      });
      const item = session.line_items?.data[0];
      summary = {
        name: item?.description ?? "Your piece",
        amount: (session.amount_total ?? 0) / 100,
        currency: (session.currency ?? "ils").toUpperCase(),
        email: session.customer_details?.email ?? null,
      };
    } catch {
      summary = null;
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl">Thank you</h1>
      <p className="mt-4 text-ink/70">
        Your order is confirmed. A confirmation is on its way{summary?.email ? ` to ${summary.email}` : ""} - we&apos;ll
        be in touch about dispatch.
      </p>

      {summary ? (
        <div className="mt-8 inline-block border border-ink/15 px-8 py-6 text-left">
          <p className="text-sm text-ink/50">Order summary</p>
          <p className="mt-2 font-display text-lg">{summary.name}</p>
          <p className="mt-1 text-sm text-ink/70">
            {summary.currency === "ILS" ? "₪" : summary.currency === "USD" ? "$" : summary.currency + " "}
            {summary.amount.toLocaleString()}
          </p>
        </div>
      ) : null}

      <div>
        <Link
          href="/shop"
          className="mt-10 inline-block border border-ink px-8 py-4 text-sm text-ink transition hover:bg-ink hover:text-ivory"
        >
          Continue browsing
        </Link>
      </div>
    </div>
  );
}
