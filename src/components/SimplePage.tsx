export function SimplePage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[0.16em] text-copper">{eyebrow}</p>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl">{title}</h1>
      {intro ? <p className="mt-5 text-ink/75">{intro}</p> : null}
      {children ? <div className="prose-akh mt-8 space-y-5 text-sm leading-relaxed text-ink/75">{children}</div> : null}
    </div>
  );
}
