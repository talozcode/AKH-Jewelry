import { getSiteSettings } from "@/lib/site-settings";
import { SiteSettingsForm } from "./SiteSettingsForm";

export const dynamic = "force-dynamic";

export default async function SiteSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="text-2xl font-medium">Settings</h1>
      <p className="mt-1 text-sm text-ink/60">
        Contact info and social links shown in the footer and across the site. Nav menu links aren&apos;t
        editable here yet.
      </p>
      <div className="mt-8">
        <SiteSettingsForm settings={settings} />
      </div>
    </div>
  );
}
