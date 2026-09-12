import { formatMoney } from "../format";

/**
 * Pure email-content builders - no I/O, directly tested (templates.test.ts),
 * matching this repo's stated testing philosophy of testing decisions, not
 * the actual send (that lives in ./send.ts, a thin Resend wrapper in the
 * same "untested third-party client" bucket as stripeClient()/
 * supabaseAdmin()). Every function returns both `html` and `text` -
 * Resend (like most providers) expects both, and a plain-text fallback
 * matters for the owner's own email alerts, which she may read on a
 * notification preview that doesn't render HTML.
 */

export type EmailContent = { subject: string; html: string; text: string };
export type EmailLineItem = { name: string; size?: string | null; quantity: number };

function itemLine(item: EmailLineItem): string {
  return `${item.name}${item.size ? `, size ${item.size}` : ""}${item.quantity > 1 ? ` x${item.quantity}` : ""}`;
}

function wrap(bodyHtml: string): string {
  return `<div style="font-family: Georgia, serif; color: #2a2a28; max-width: 480px; margin: 0 auto;">
    <p style="font-size: 22px; font-style: italic; margin-bottom: 24px;">akh.</p>
    ${bodyHtml}
    <p style="margin-top: 32px; font-size: 12px; color: #8a8a86;">AKH Jewelry - akhjewelry.com</p>
  </div>`;
}

export function orderConfirmationEmail(input: {
  customerName: string;
  items: EmailLineItem[];
  amountTotal: number;
  currency: string;
  specialInstructions: string | null;
}): EmailContent {
  const itemLines = input.items.map(itemLine);
  const total = formatMoney(input.amountTotal, input.currency);
  return {
    subject: "Your AKH order is confirmed",
    html: wrap(`
      <p>Hi ${input.customerName || "there"},</p>
      <p>Your order is confirmed - thank you for choosing AKH.</p>
      <ul>${itemLines.map((line) => `<li>${line}</li>`).join("")}</ul>
      <p><strong>Total: ${total}</strong></p>
      ${input.specialInstructions ? `<p>Your note: "${input.specialInstructions}"</p>` : ""}
      <p>We will be in touch once your piece ships.</p>
    `),
    text: [
      `Hi ${input.customerName || "there"},`,
      "",
      "Your order is confirmed - thank you for choosing AKH.",
      "",
      ...itemLines,
      "",
      `Total: ${total}`,
      input.specialInstructions ? `Your note: "${input.specialInstructions}"` : "",
      "",
      "We will be in touch once your piece ships.",
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

export function orderShippedEmail(input: {
  customerName: string;
  items: EmailLineItem[];
  trackingNumber: string | null;
  carrier: string | null;
}): EmailContent {
  const itemLines = input.items.map(itemLine);
  const trackingLine = input.trackingNumber
    ? `Tracking number: ${input.trackingNumber}${input.carrier ? ` (${input.carrier})` : ""}`
    : null;
  return {
    subject: "Your AKH order has shipped",
    html: wrap(`
      <p>Hi ${input.customerName || "there"},</p>
      <p>Your order is on its way.</p>
      <ul>${itemLines.map((line) => `<li>${line}</li>`).join("")}</ul>
      ${trackingLine ? `<p><strong>${trackingLine}</strong></p>` : ""}
    `),
    text: [`Hi ${input.customerName || "there"},`, "", "Your order is on its way.", "", ...itemLines, "", trackingLine ?? ""]
      .filter(Boolean)
      .join("\n"),
  };
}

export function refundConfirmationEmail(input: { customerName: string; amountRefunded: number; currency: string }): EmailContent {
  const amount = formatMoney(input.amountRefunded, input.currency);
  return {
    subject: "Your AKH refund has been issued",
    html: wrap(`
      <p>Hi ${input.customerName || "there"},</p>
      <p>A refund of <strong>${amount}</strong> has been issued to your original payment method. It may take a few
      business days to appear, depending on your bank.</p>
    `),
    text: [
      `Hi ${input.customerName || "there"},`,
      "",
      `A refund of ${amount} has been issued to your original payment method. It may take a few business days to appear, depending on your bank.`,
    ].join("\n"),
  };
}

export function ownerNewOrderAlertEmail(input: {
  customerName: string;
  items: EmailLineItem[];
  amountTotal: number;
  currency: string;
  adminOrdersUrl: string;
}): EmailContent {
  const itemLines = input.items.map(itemLine);
  const total = formatMoney(input.amountTotal, input.currency);
  return {
    subject: `New order: ${total} from ${input.customerName || "a customer"}`,
    html: wrap(`
      <p>New order from <strong>${input.customerName || "a customer"}</strong>.</p>
      <ul>${itemLines.map((line) => `<li>${line}</li>`).join("")}</ul>
      <p><strong>Total: ${total}</strong></p>
      <p><a href="${input.adminOrdersUrl}">View in the admin</a></p>
    `),
    text: [`New order from ${input.customerName || "a customer"}.`, "", ...itemLines, "", `Total: ${total}`, "", input.adminOrdersUrl].join(
      "\n"
    ),
  };
}

export function ownerDisputeAlertEmail(input: { customerName: string; amount: number; currency: string; adminOrdersUrl: string }): EmailContent {
  const amount = formatMoney(input.amount, input.currency);
  return {
    subject: `Dispute opened: ${amount} from ${input.customerName || "a customer"}`,
    html: wrap(`
      <p><strong>${input.customerName || "A customer"}</strong> has disputed a charge of <strong>${amount}</strong> with
      their bank.</p>
      <p>Respond with evidence in your Stripe Dashboard before the deadline shown there - a missed deadline is an
      automatic loss.</p>
      <p><a href="${input.adminOrdersUrl}">View the order</a></p>
    `),
    text: [
      `${input.customerName || "A customer"} has disputed a charge of ${amount} with their bank.`,
      "",
      "Respond with evidence in your Stripe Dashboard before the deadline shown there - a missed deadline is an automatic loss.",
      "",
      input.adminOrdersUrl,
    ].join("\n"),
  };
}

/** Closes the "no error alerting anywhere" gap: previously a failure in
 *  the webhook's catch blocks (a failed order insert, a failed stock
 *  decrement, an oversell) only ever reached Vercel's server logs - a
 *  surface the owner has no reason to know exists. `context` is a short
 *  machine-readable tag (e.g. "checkout.session.completed"), `detail` the
 *  actual error message/description. */
export function ownerErrorAlertEmail(input: { context: string; detail: string }): EmailContent {
  return {
    subject: `Something needs attention: ${input.context}`,
    html: wrap(`
      <p>Something went wrong that may need your attention.</p>
      <p><strong>Where:</strong> ${input.context}</p>
      <p><strong>What happened:</strong> ${input.detail}</p>
      <p>If this involves a customer's order, check /admin/orders. If you're not sure what to do, it's always fine to
      ask before changing anything.</p>
    `),
    text: [
      "Something went wrong that may need your attention.",
      "",
      `Where: ${input.context}`,
      `What happened: ${input.detail}`,
      "",
      "If this involves a customer's order, check /admin/orders. If you're not sure what to do, it's always fine to ask before changing anything.",
    ].join("\n"),
  };
}
