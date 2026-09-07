import Link from "next/link";
import { NewsletterForm } from "./NewsletterForm";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { href: "/shop?category=Rings", label: "Rings" },
      { href: "/shop?category=Necklaces", label: "Necklaces" },
      { href: "/shop?category=Bracelets", label: "Bracelets" },
    ],
  },
  {
    title: "Studio",
    links: [
      { href: "/story", label: "About AKH" },
      { href: "/bespoke", label: "Bespoke" },
      { href: "/contact", label: "Contact" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Care & Policies",
    links: [
      { href: "/shipping-returns", label: "Shipping & Returns" },
      { href: "/care", label: "Jewelry Care" },
      { href: "/size-guide", label: "Size Guide" },
      { href: "/terms", label: "Terms & Privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-ivory/10 bg-charcoal text-ivory">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-2">
            <span className="font-display text-2xl">
              akh<span className="text-copper-soft">.</span>
            </span>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ivory/60">
              An independent jewelry studio. Sculptural pieces handcrafted in limited
              quantities, shaped by natural materials, personal symbolism and the
              character of each stone.
            </p>
            <div className="mt-6 flex gap-4 text-sm text-ivory/70">
              <a href="https://www.instagram.com/akhjewelry" target="_blank" rel="noreferrer" className="hover:text-copper-soft">
                Instagram
              </a>
              <a href="https://www.tiktok.com/@akh.jewelry" target="_blank" rel="noreferrer" className="hover:text-copper-soft">
                TikTok
              </a>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs uppercase tracking-[0.16em] text-ivory/50">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-ivory/75 hover:text-copper-soft">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-ivory/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <NewsletterForm />
          <a href="mailto:hello@akhjewelry.com" className="text-sm text-ivory/60 hover:text-copper-soft">
            hello@akhjewelry.com
          </a>
        </div>

        <p className="mt-8 text-xs text-ivory/35">
          © {new Date().getFullYear()} AKH Jewelry. Handmade in small batches. All sales final on made-to-order pieces.
        </p>
      </div>
    </footer>
  );
}
