import { describe, expect, it, vi } from "vitest";

// The only module-boundary mock needed in this whole test suite: everything
// else in this codebase is tested as a pure function instead (see
// src/lib/db/orders.ts, src/lib/products.ts, src/lib/checkoutParams.ts).
// This webhook's outer guard logic (missing config, a bad signature) can't
// be exercised that way without either a real signed Stripe payload or a
// fake Stripe client, and building a real signed payload for the "config
// is missing" case doesn't even make sense (there'd be no secret to sign
// against).
vi.mock("@/lib/stripe", () => ({ stripeClient: vi.fn() }));

import { stripeClient } from "@/lib/stripe";
import { POST } from "./route";

function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    headers,
    body: "{}",
  });
}

describe("POST /api/webhooks/stripe", () => {
  it("fails closed with 400, without ever calling Stripe, when STRIPE_WEBHOOK_SECRET is unset", async () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "");
    vi.mocked(stripeClient).mockClear();

    const res = await POST(makeRequest({ "stripe-signature": "t=1,v1=abc" }));

    expect(res.status).toBe(400);
    expect(stripeClient).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });

  it("returns 400, without calling Stripe, when the stripe-signature header is missing", async () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test");
    vi.mocked(stripeClient).mockClear();

    const res = await POST(makeRequest());

    expect(res.status).toBe(400);
    expect(stripeClient).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });

  it("returns 400 when signature verification throws, instead of propagating a 500", async () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test");
    vi.mocked(stripeClient).mockReturnValue({
      webhooks: {
        constructEvent: () => {
          throw new Error("No signatures found matching the expected signature for payload");
        },
      },
    } as unknown as ReturnType<typeof stripeClient>);

    const res = await POST(makeRequest({ "stripe-signature": "t=1,v1=bad" }));

    expect(res.status).toBe(400);
    vi.unstubAllEnvs();
  });
});
