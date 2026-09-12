import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-settings";
import { getStripeCredentialsStatus } from "@/lib/stripeSettings";
import { SiteSettingsForm } from "./SiteSettingsForm";
import { StripeSettingsForm } from "./StripeSettingsForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings" };

export default async function SiteSettingsPage() {
  const [settings, stripeStatus] = await Promise.all([getSiteSettings(), getStripeCredentialsStatus()]);

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--admin-text)]">Settings</h1>
        <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
          Contact info and social links shown in the footer and across the site. Nav menu links aren&apos;t
          editable here yet.
        </p>
        <div className="mt-8">
          <SiteSettingsForm settings={settings} />
        </div>
      </div>

      <div className="border-t border-[var(--admin-border)] pt-10">
        <h2 className="text-2xl font-semibold text-[var(--admin-text)]">Payments</h2>
        <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
          Your own Stripe account for taking payments and issuing refunds. Only you can see or change this.
        </p>
        <div className="mt-8">
          <StripeSettingsForm status={stripeStatus} />
        </div>
      </div>
    </div>
  );
}
