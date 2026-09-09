import type { Metadata } from "next";
import { getPage } from "@/lib/pages";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Story",
  description: "The studio, the bench and the process behind AKH Jewelry.",
};

export default async function StoryPage() {
  const [content, settings] = await Promise.all([getPage("story"), getSiteSettings()]);
  const paragraphs = content.bodyProse.split(/\n\n+/);

  return (
    <>
      <section className="bg-charcoal text-ivory">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">{content.heroHeadline}</h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="aspect-[4/5] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={content.heroImageUrl} alt={content.heroImageAlt} className="h-full w-full object-cover" />
        </div>
        <div className="space-y-5 text-sm leading-relaxed text-ink/75">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      <section className="bg-ivory-deep">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl">{content.closingHeading}</h2>
          <a
            href={`mailto:${settings.contactEmail}`}
            className="mt-6 inline-block border border-ink px-7 py-3.5 text-sm text-ink transition hover:bg-ink hover:text-ivory"
          >
            {content.closingCtaLabel}
          </a>
        </div>
      </section>
    </>
  );
}
