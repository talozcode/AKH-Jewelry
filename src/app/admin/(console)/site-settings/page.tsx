import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-settings";
import { SiteSettingsForm } from "./SiteSettingsForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings" };

export default async function SiteSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
      <p className="mt-1 text-sm text-slate-500">
        Contact info and social links shown in the footer and across the site. Nav menu links aren&apos;t
        editable here yet.
      </p>
      <div className="mt-8">
        <SiteSettingsForm settings={settings} />
      </div>
    </div>
  );
}
