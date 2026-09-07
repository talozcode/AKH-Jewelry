import type { CSSProperties } from "react";

// Deliberately neutral (fixed white/ink, not styled per-concept) — this is
// a documentation panel for reviewing the raw tokens, not part of the pitch.
export function SpecimenLegend({
  swatches,
  specimens,
}: {
  swatches: { name: string; hex: string }[];
  specimens: { label: string; style: CSSProperties }[];
}) {
  return (
    <div className="mx-auto mt-16 max-w-3xl border border-black/10 bg-white px-6 py-6 text-black">
      <p className="text-[11px] uppercase tracking-[0.14em] text-black/40">Palette &amp; type</p>
      <div className="mt-4 flex flex-wrap gap-4">
        {swatches.map((s) => (
          <div key={s.hex} className="flex items-center gap-2">
            <span className="h-8 w-8 shrink-0 border border-black/10" style={{ backgroundColor: s.hex }} />
            <span className="text-xs leading-tight">
              {s.name}
              <br />
              <span className="text-black/40">{s.hex}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="mt-5 space-y-2 border-t border-black/10 pt-4">
        {specimens.map((s) => (
          <div key={s.label} className="flex items-baseline gap-3">
            <span style={s.style}>Aa Bb 123</span>
            <span className="text-[11px] text-black/40">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
