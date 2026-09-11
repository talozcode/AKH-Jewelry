import type { Metadata } from "next";
import { PrivacyLookupForm } from "./PrivacyLookupForm";

export const metadata: Metadata = { title: "Data requests" };

export default function PrivacyRequestsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Data requests</h1>
      <p className="mt-1 text-sm text-slate-500">
        Look up, export or erase a customer&apos;s personal data, for a GDPR, CCPA or Israeli PPL request. See the{" "}
        <a href="/privacy" target="_blank" rel="noreferrer" className="underline">
          Privacy Policy
        </a>{" "}
        for what these rights cover.
      </p>

      <div className="mt-6 max-w-2xl">
        <PrivacyLookupForm />
      </div>
    </div>
  );
}
