import { tokenMatches } from "./admin/tokenMatch";
import { hashPassword, verifyPassword } from "./crypto/password";
import { supabaseAdmin } from "./supabase/server";

/**
 * Lets the owner rotate her own admin login password from
 * /admin/site-settings instead of needing Vercel access to change
 * ADMIN_TOKEN - same handover motivation as stripeSettings.ts.
 *
 * Deliberately does NOT change `tokenMatches()` in ./admin/auth.ts, which
 * stays exactly what it always was: a pure, synchronous, env-var-only
 * comparison with its own direct test coverage
 * (src/lib/admin/auth.test.ts). This module wraps it instead of replacing
 * it - `verifyAdminCredential()` checks a DB-stored rotated password first
 * (if she's ever set one) and falls back to `tokenMatches()` otherwise,
 * so the existing pure-function test stays valid and unchanged.
 */

export type AdminPasswordStatus = {
  customSet: boolean;
  updatedAt: string | null;
};

async function readRow(): Promise<{ admin_password_hash: string | null; admin_password_updated_at: string | null } | null> {
  const { data, error } = await supabaseAdmin()
    .from("site_settings")
    .select("admin_password_hash, admin_password_updated_at")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw new Error(`adminPassword: ${error.message}`);
  return data;
}

/** Admin UI only - never returns the hash, just whether one's been set. */
export async function getAdminPasswordStatus(): Promise<AdminPasswordStatus> {
  const row = await readRow();
  return { customSet: Boolean(row?.admin_password_hash), updatedAt: row?.admin_password_updated_at ?? null };
}

/**
 * The real login check - used by isAuthenticated() and the login page.
 * Once she's set her own password, it's the ONLY value that works
 * (matches the "hers takes priority, replaces the developer default" rule
 * already used for Stripe credentials) - the ADMIN_TOKEN env var is only
 * ever consulted before she's rotated anything.
 */
export async function verifyAdminCredential(candidate: string | undefined): Promise<boolean> {
  if (!candidate) return false;
  const row = await readRow();
  if (row?.admin_password_hash) return verifyPassword(candidate, row.admin_password_hash);
  return tokenMatches(candidate);
}

/** Admin only - call requireAdminAction() before this. */
export async function setAdminPassword(newPassword: string): Promise<void> {
  const hash = await hashPassword(newPassword);
  const { error } = await supabaseAdmin()
    .from("site_settings")
    .update({ admin_password_hash: hash, admin_password_updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) throw new Error(`setAdminPassword: ${error.message}`);
}
