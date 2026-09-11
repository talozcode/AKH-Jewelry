import Link from "next/link";

const LINKS = [
  { href: "#concept-a", label: "A - Earth & Hand" },
  { href: "#concept-b", label: "B - Talisman" },
  { href: "#concept-c", label: "C - Rooted" },
  { href: "#concept-d", label: "D - One of One" },
  { href: "#concept-e", label: "E - Gallery" },
];

export function ConceptNav() {
  return (
    <nav className="sticky top-0 z-50 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-black/10 bg-white/95 px-6 py-3 text-sm text-black backdrop-blur">
      <Link href="/" className="text-black/50 underline underline-offset-4 hover:text-black">
        ← Back to live site
      </Link>
      <span className="hidden text-black/20 sm:inline">|</span>
      {LINKS.map((l) => (
        <a key={l.href} href={l.href} className="underline underline-offset-4 hover:text-black/60">
          {l.label}
        </a>
      ))}
    </nav>
  );
}
