import { describe, expect, it, vi } from "vitest";

// The only module-boundary mocks needed in this whole test suite: everything
// else in this codebase is tested as a pure function instead (see
// src/lib/db/orders.ts, src/lib/products.ts, src/lib/checkoutParams.ts).
// This webhook's outer guard logic (missing config, a bad signature) can't
// be exercised that way without either a real signed Stripe payload or a
// fake Stripe client, and building a real signed payload for the "config
// is missing" case doesn't even make sense (there'd be no secret to sign
// against). stripeSettings is mocked too, now that the webhook secret can
// come from the database - resolveStripeWebhookSecret() would otherwise
// hit supabaseAdmin() with no Supabase env configured in this test run.
vi.mock("@/lib/stripe", () => ({ stripeClient: vi.fn() }));
vi.mock("@/lib/stripeSettings", () => ({ resolveStripeWebhookSecret: vi.fn() }));

import { stripeClient } from "@/lib/stripe";
import { resolveStripeWebhookSecret } from "@/lib/stripeSettings";
import { POST } from "./route";

function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    headers,
    body: "{}",
  });
}

describe("POST /api/webhooks/stripe", () => {
  it("fails closed with 400, without ever calling Stripe, when no webhook secret is configured", async () => {
    vi.mocked(resolveStripeWebhookSecret).mockResolvedValue(null);
    vi.mocked(stripeClient).mockClear();

    const res = await POST(makeRequest({ "stripe-signature": "t=1,v1=abc" }));

    expect(res.status).toBe(400);
    expect(stripeClient).not.toHaveBeenCalled();
  });

  it("returns 400, without checking the configured secret or calling Stripe, when the stripe-signature header is missing", async () => {
    vi.mocked(resolveStripeWebhookSecret).mockClear();
    vi.mocked(stripeClient).mockClear();

    const res = await POST(makeRequest());

    expect(res.status).toBe(400);
    expect(resolveStripeWebhookSecret).not.toHaveBeenCalled();
    expect(stripeClient).not.toHaveBeenCalled();
  });

  it("returns 400 when signature verification throws, instead of propagating a 500", async () => {
    vi.mocked(resolveStripeWebhookSecret).mockResolvedValue("whsec_test");
    vi.mocked(stripeClient).mockResolvedValue({
      webhooks: {
        constructEvent: () => {
          throw new Error("No signatures found matching the expected signature for payload");
        },
      },
    } as unknown as Awaited<ReturnType<typeof stripeClient>>);

    const res = await POST(makeRequest({ "stripe-signature": "t=1,v1=bad" }));

    expect(res.status).toBe(400);
  });
});
