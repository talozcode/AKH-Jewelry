export function SimplePage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl sm:text-4xl">{title}</h1>
      {intro ? <p className="mt-5 text-ink/75">{intro}</p> : null}
      {children ? <div className="prose-akh mt-8 space-y-5 text-sm leading-relaxed text-ink/75">{children}</div> : null}
    </div>
  );
}
