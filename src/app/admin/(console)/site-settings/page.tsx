import type { Metadata } from "next";
import { getAdminPasswordStatus } from "@/lib/adminPassword";
import { getSiteSettings } from "@/lib/site-settings";
import { getStripeCredentialsStatus } from "@/lib/stripeSettings";
import { AdminPasswordForm } from "./AdminPasswordForm";
import { SiteSettingsForm } from "./SiteSettingsForm";
import { StripeSettingsForm } from "./StripeSettingsForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings" };

export default async function SiteSettingsPage() {
  const [settings, stripeStatus, passwordStatus] = await Promise.all([
    getSiteSettings(),
    getStripeCredentialsStatus(),
    getAdminPasswordStatus(),
  ]);

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

      <div className="border-t border-[var(--admin-border)] pt-10">
        <h2 className="text-2xl font-semibold text-[var(--admin-text)]">Your password</h2>
        <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
          The password you use to sign in at /admin/login. Change it any time - no one else needs to be involved.
        </p>
        <div className="mt-8">
          <AdminPasswordForm status={passwordStatus} />
        </div>
      </div>
    </div>
  );
}
