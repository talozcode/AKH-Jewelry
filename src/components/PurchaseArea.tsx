"use client";

import { useState, useTransition } from "react";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { createReservation } from "@/lib/actions/reservations";

export function PurchaseArea({ product, contactEmail = "hello@akhjewelry.com" }: { product: Product; contactEmail?: string }) {
  const [size, setSize] = useState(product.availableSizes?.[0] ?? "");
  const [showForm, setShowForm] = useState(false);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const disabled = product.availability === "Out of Stock";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createReservation({
        product,
        size: size || undefined,
        customerName: String(formData.get("name") ?? ""),
        customerEmail: String(formData.get("email") ?? ""),
        customerPhone: String(formData.get("phone") ?? ""),
        message: String(formData.get("message") ?? ""),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSent(true);
      setShowForm(false);
    });
  }

  return (
    <div>
      {product.availableSizes ? (
        <div className="mb-5">
          <div className="mb-2 flex items-baseline justify-between">
            <label className="text-xs uppercase tracking-[0.1em] text-ink/60">Size</label>
            <a href="/size-guide" className="text-xs text-copper underline underline-offset-2">
              Size guide
            </a>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.availableSizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`min-w-11 border px-3 py-2 text-sm transition ${
                  size === s ? "border-charcoal bg-charcoal text-ivory" : "border-ink/25 hover:border-ink"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {sent ? (
        <div className="border border-charcoal/30 bg-ivory-deep/40 px-4 py-4 text-sm text-ink/75">
          Request sent — we&apos;ll reach out shortly to confirm this piece and arrange payment.
        </div>
      ) : showForm ? (
        <form onSubmit={handleSubmit} className="space-y-3 border border-ink/15 p-4">
          <p className="text-xs text-ink/60">
            Reserve {product.name}{size ? ` (size ${size})` : ""}. No payment is taken here — we&apos;ll
            contact you to confirm and arrange payment.
          </p>
          <input
            name="name"
            required
            placeholder="Full name"
            className="w-full border border-ink/20 bg-ivory px-3 py-2.5 text-sm outline-none focus:border-ink"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="w-full border border-ink/20 bg-ivory px-3 py-2.5 text-sm outline-none focus:border-ink"
          />
          <input
            name="phone"
            type="tel"
            required
            placeholder="Phone"
            className="w-full border border-ink/20 bg-ivory px-3 py-2.5 text-sm outline-none focus:border-ink"
          />
          <textarea
            name="message"
            placeholder="Message (optional)"
            className="min-h-16 w-full border border-ink/20 bg-ivory px-3 py-2.5 text-sm outline-none focus:border-ink"
          />
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 bg-charcoal py-3 text-sm uppercase tracking-[0.14em] text-ivory transition hover:bg-charcoal-soft disabled:opacity-60"
            >
              {pending ? "Sending…" : "Send Request"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="border border-ink/25 px-4 text-sm hover:border-ink"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          disabled={disabled}
          onClick={() => setShowForm(true)}
          className="w-full bg-charcoal py-4 text-sm uppercase tracking-[0.14em] text-ivory transition hover:bg-charcoal-soft disabled:cursor-not-allowed disabled:bg-charcoal/30"
        >
          {disabled ? "Out of Stock" : "Add to Cart"}
        </button>
      )}

      {!sent && !showForm ? (
        <a
          href={`mailto:${contactEmail}?subject=Enquiry: ${encodeURIComponent(product.name)}`}
          className="mt-3 block w-full border border-ink/25 py-3.5 text-center text-sm uppercase tracking-[0.14em] text-ink transition hover:border-ink"
        >
          Enquire by Email
        </a>
      ) : null}

      <ul className="mt-6 space-y-2 text-sm text-ink/70">
        <li>{product.dispatch}</li>
        <li>Free returns within 14 days on in-stock pieces</li>
        <li>Secure payment via Stripe at checkout launch</li>
        <li>Arrives in an AKH gift box with a satin pouch, in our branded bag</li>
        <li>International orders may be subject to local customs duties</li>
      </ul>
    </div>
  );
}

export function StickyMobileBar({ product }: { product: Product }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-ink/10 bg-ivory/95 px-4 py-3 backdrop-blur md:hidden">
      <div>
        <p className="font-display text-sm">{product.name}</p>
        <p className="text-sm text-ink/70">{formatPrice(product)}</p>
      </div>
      <a
        href="#purchase"
        className="bg-charcoal px-5 py-3 text-xs uppercase tracking-[0.14em] text-ivory"
      >
        Add to Cart
      </a>
    </div>
  );
}
