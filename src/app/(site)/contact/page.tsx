import type { Metadata } from "next";
import { SimplePage } from "@/components/SimplePage";
import { getPage } from "@/lib/pages";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the AKH studio.",
};

export default async function ContactPage() {
  const [content, settings] = await Promise.all([getPage("contact"), getSiteSettings()]);

  return (
    <SimplePage title={content.heading} intro={content.intro}>
      <p>
        <a href={`mailto:${settings.contactEmail}`} className="text-copper underline underline-offset-2">
          {settings.contactEmail}
        </a>
      </p>
      <p>{content.bodyProse}</p>
      <p>
        {settings.instagramUrl ? (
          <>
            Follow along at{" "}
            <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="text-copper underline underline-offset-2">
              @akhjewelry
            </a>
            {settings.tiktokUrl ? (
              <>
                {" "}
                and{" "}
                <a href={settings.tiktokUrl} target="_blank" rel="noreferrer" className="text-copper underline underline-offset-2">
                  @akh.jewelry
                </a>
              </>
            ) : null}
            .
          </>
        ) : null}
      </p>
    </SimplePage>
  );
}
