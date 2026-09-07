type Motif = "ring" | "necklace" | "bangle" | "hands" | "editorial";
type Tone = "copper" | "ink" | "stone";

const TONE_HEX: Record<Tone, string> = {
  copper: "#b0602f",
  ink: "#1c1812",
  stone: "#837a6a",
};

function Icon({ motif, stroke }: { motif: Motif; stroke: string }) {
  const common = { fill: "none", stroke, strokeWidth: 1.1, vectorEffect: "non-scaling-stroke" as const };
  switch (motif) {
    case "ring":
      return (
        <g transform="translate(50 50)">
          <circle r="22" {...common} />
          <circle r="16" {...common} strokeWidth={0.6} opacity={0.5} />
          <circle cx="0" cy="-22" r="2.4" fill={stroke} stroke="none" />
        </g>
      );
    case "necklace":
      return (
        <g transform="translate(50 46)">
          <path d="M -24 -20 Q 0 6 24 -20" {...common} />
          <path d="M -3 4 L 3 4 L 5 22 Q 0 28 -5 22 Z" {...common} />
        </g>
      );
    case "bangle":
      return (
        <g transform="translate(50 50)">
          <circle r="24" {...common} strokeWidth={2.2} />
        </g>
      );
    case "hands":
      return (
        <g transform="translate(50 52)">
          <path d="M -26 10 Q -20 -14 -2 -10 Q 16 -6 24 12" {...common} />
          <circle cx="-2" cy="-10" r="3" fill={stroke} stroke="none" />
        </g>
      );
    case "editorial":
    default:
      return (
        <g transform="translate(50 50)">
          <path d="M -20 26 L -6 -26 L 8 26" {...common} />
          <circle cx="1" cy="-2" r="1.8" fill={stroke} stroke="none" />
        </g>
      );
  }
}

export function PlaceholderArt({
  motif,
  tone = "copper",
  variant = "light",
  label,
  className = "",
}: {
  motif: Motif;
  tone?: Tone;
  variant?: "light" | "dark";
  label?: string;
  className?: string;
}) {
  const stroke = TONE_HEX[tone];
  const bg =
    variant === "dark"
      ? "linear-gradient(135deg, #17140f 0%, #241f16 55%, #17140f 100%)"
      : "linear-gradient(135deg, #ece3d3 0%, #f4eee3 55%, #e6dcc8 100%)";

  return (
    <div
      className={`placeholder-art relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}
      style={{ backgroundImage: bg }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="h-2/5 w-2/5 opacity-80">
        <Icon motif={motif} stroke={stroke} />
      </svg>
      {label ? (
        <span
          className="absolute bottom-2 right-2 rounded-sm px-1.5 py-0.5 text-[9px] font-sans uppercase tracking-[0.14em] opacity-45"
          style={{ color: variant === "dark" ? "#f4eee3" : "#1c1812" }}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}
