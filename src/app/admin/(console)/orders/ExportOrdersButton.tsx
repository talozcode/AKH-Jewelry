"use client";

import { useState, useTransition } from "react";
import type { OrderStatus } from "@/lib/db/orders";
import { exportOrdersCsvAction } from "./actions";

/** Same blob-download pattern already used by PrivacyLookupForm's JSON
 *  export - a Server Action can't trigger a browser file download
 *  directly, so it returns the CSV text and this builds the download
 *  client-side. `status` mirrors whatever filter tab is currently active
 *  on the page, so the export matches what's on screen. */
export function ExportOrdersButton({ status }: { status?: OrderStatus }) {
  const [exporting, startExport] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleExport() {
    setError(null);
    startExport(async () => {
      const result = await exportOrdersCsvAction(status);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `akh-orders${status ? `-${status}` : ""}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleExport}
        disabled={exporting}
        className="rounded-md border border-[var(--admin-border-strong)] px-3 py-1.5 text-sm font-medium text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)] disabled:opacity-50"
      >
        {exporting ? "Exporting…" : "Export CSV"}
      </button>
      {error ? <span className="text-xs text-[var(--admin-danger)]">{error}</span> : null}
    </div>
  );
}
