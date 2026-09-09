import type { Metadata } from "next";
import { getPage } from "@/lib/pages";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bespoke",
  description: "Commission a one-of-one piece from the AKH studio.",
};

export default async function BespokePage() {
  const [content, settings] = await Promise.all([getPage("bespoke"), getSiteSettings()]);

  return (
    <>
      <section className="relative flex min-h-[50vh] items-end overflow-hidden bg-charcoal text-ivory">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={content.heroImageUrl} alt={content.heroImageAlt} className="h-full w-full object-cover opacity-70" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-charcoal/20" />
        <div className="relative mx-auto w-full max-w-5xl px-4 pb-14 sm:px-6 lg:px-8">
          <h1 className="max-w-xl font-display text-4xl leading-tight sm:text-5xl">{content.heroHeadline}</h1>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <ol className="grid grid-cols-1 gap-x-10 gap-y-10 border-t border-ink/10 pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {content.steps.map((step, i) => (
            <li key={step.title} className="border-l border-ink/15 pl-5">
              <span className="text-sm text-mineral">{i + 1}</span>
              <h2 className="mt-2 text-base">{step.title}</h2>
              <p className="mt-2 text-sm text-ink/70">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-16 border-t border-ink/10 pt-10 text-center">
          <h2 className="font-display text-2xl">{content.closingHeading}</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-ink/70">{content.closingBody}</p>
          <a
            href={`mailto:${settings.contactEmail}?subject=Bespoke Enquiry`}
            className="mt-6 inline-block border border-ink px-8 py-4 text-sm text-ink transition hover:bg-ink hover:text-ivory"
          >
            {content.closingCtaLabel}
          </a>
        </div>
      </section>
    </>
  );
}
