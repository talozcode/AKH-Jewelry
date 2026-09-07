// The page's own neutral narrator voice — identical treatment for all four
// concepts, deliberately outside each concept's own full-bleed styling.
export function ConceptLabel({ id, title, rationale }: { id: string; title: string; rationale: string }) {
  return (
    <header id={id} className="mx-auto max-w-2xl scroll-mt-16 px-6 py-10 text-center">
      <p className="text-xs text-mineral">Concept</p>
      <h2 className="mt-1 font-display text-2xl text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink/70">{rationale}</p>
    </header>
  );
}
