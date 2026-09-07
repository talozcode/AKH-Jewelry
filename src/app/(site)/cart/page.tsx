import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cart",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl">Your cart is empty</h1>
      <p className="mt-4 text-ink/70">
        Online checkout is launching soon. In the meantime, browse the collection
        and email hello@akhjewelry.com to reserve any piece.
      </p>
      <Link
        href="/shop"
        className="mt-8 inline-block border border-ink px-8 py-4 text-sm text-ink transition hover:bg-ink hover:text-ivory"
      >
        Shop the collection
      </Link>
    </div>
  );
}
