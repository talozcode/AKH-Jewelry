import { createClient } from "@supabase/supabase-js";
import { createRequire } from "node:module";
import type { Database } from "./database.types";

// This app never uses Supabase Realtime, but supabase-js always constructs
// a RealtimeClient internally, which needs a WebSocket constructor. Next.js's
// server runtime has one; a plain `tsx` script (e.g. scripts/seed-products.ts)
// on Node 20 does not - fall back to the `ws` package there.
const wsTransport =
  typeof WebSocket === "undefined" ? (createRequire(import.meta.url)("ws") as typeof import("ws")) : undefined;

/**
 * Server-only Supabase client, authenticated with the secret key (bypasses
 * RLS). Never import this from a Client Component or anything that ships to
 * the browser - it belongs in Server Components, Server Actions, and
 * scripts only. There is deliberately no browser/publishable-key client
 * anywhere in this app: every read and write goes through the server.
 */
export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL / SUPABASE_SECRET_KEY are not set. Add them to .env.local (see CLAUDE.md's CMS section)."
    );
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false },
    ...(wsTransport ? { realtime: { transport: wsTransport as unknown as typeof WebSocket } } : {}),
  });
}
