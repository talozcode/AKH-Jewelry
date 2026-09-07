import type { CSSProperties } from "react";

// Rendered as the FIRST element inside each concept's own colored section
// (not a separate neutral strip between sections) so there's no cream gap
// before a dark/colored concept begins — colors/fonts are passed in per
// concept so the label reads as part of that concept, not the page's own
// narrator voice.
export function ConceptLabel({
  id,
  title,
  rationale,
  titleStyle,
  mutedStyle,
}: {
  id: string;
  title: string;
  rationale: string;
  titleStyle: CSSProperties;
  mutedStyle: CSSProperties;
}) {
  return (
    <header id={id} className="mx-auto max-w-2xl scroll-mt-16 px-6 pt-12 pb-6 text-center">
      <p style={mutedStyle}>Concept</p>
      <h2 className="mt-1" style={titleStyle}>
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-md" style={mutedStyle}>
        {rationale}
      </p>
    </header>
  );
}
