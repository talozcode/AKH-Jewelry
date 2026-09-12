import { Resend } from "resend";
import type { EmailContent } from "./templates";

/**
 * Thin Resend wrapper - untested, same bucket as stripeClient()/
 * supabaseAdmin() (a third-party client, not decision logic). Gracefully
 * degrades exactly like stripeClient() did before the owner could set her
 * own key: if RESEND_API_KEY/EMAIL_FROM aren't set, every send is logged
 * and skipped rather than throwing, so the checkout/refund/shipping flows
 * this is called from keep working with no email provider configured yet
 * - a real, hard sequencing constraint (a Resend account + a verified
 * sending domain for akhjewelry.com don't exist yet as of this writing),
 * not a style choice, matching how the Stripe webhook secret was handled
 * before this app existed to make its own account.
 */

function resendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function fromAddress(): string {
  return process.env.EMAIL_FROM || "AKH Jewelry <hello@akhjewelry.com>";
}

/** The owner's own inbox, for order/error/dispute alerts meant for her,
 *  not the customer. */
export function ownerEmailAddress(): string | null {
  return process.env.OWNER_EMAIL || null;
}

export async function sendEmail(input: { to: string; replyTo?: string } & EmailContent): Promise<{ ok: true } | { ok: false; error: string }> {
  const resend = resendClient();
  if (!resend) {
    console.error(`email not sent (RESEND_API_KEY not configured yet): "${input.subject}" -> ${input.to}`);
    return { ok: false, error: "Email not configured" };
  }
  try {
    const { error } = await resend.emails.send({
      from: fromAddress(),
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      ...(input.replyTo ? { replyTo: input.replyTo } : {}),
    });
    if (error) {
      console.error("resend send failed:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    console.error("resend send threw:", err);
    return { ok: false, error: err instanceof Error ? err.message : "unknown error" };
  }
}
