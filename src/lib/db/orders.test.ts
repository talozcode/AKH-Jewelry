import { describe, expect, it } from "vitest";
import { canRefund } from "./orders";

describe("canRefund", () => {
  it("allows refunding an unfulfilled order with a payment intent", () => {
    expect(canRefund({ status: "unfulfilled", stripe_payment_intent_id: "pi_123" })).toEqual({ ok: true });
  });

  it("allows refunding a shipped order with a payment intent", () => {
    expect(canRefund({ status: "shipped", stripe_payment_intent_id: "pi_123" })).toEqual({ ok: true });
  });

  it("rejects an order that's already refunded", () => {
    const result = canRefund({ status: "refunded", stripe_payment_intent_id: "pi_123" });
    expect(result.ok).toBe(false);
  });

  it("rejects an order with no Stripe payment intent, a genuinely reachable case", () => {
    const result = canRefund({ status: "unfulfilled", stripe_payment_intent_id: null });
    expect(result.ok).toBe(false);
  });

  it("reports 'already refunded' (not 'no payment intent') when both are true, since that's the more useful message", () => {
    // An already-refunded order plausibly still has no payment_intent
    // recorded in some odd data state; "already refunded" is the more
    // actionable message for the owner to see, so the status check must
    // run first.
    const result = canRefund({ status: "refunded", stripe_payment_intent_id: null });
    expect(result).toEqual({ ok: false, reason: "This order has already been refunded." });
  });
});
