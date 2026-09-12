import { describe, expect, it } from "vitest";
import { looksLikeStripeSecretKey, looksLikeStripeWebhookSecret } from "./stripe";

// Every fixture is built at runtime (prefix + repeated character), never
// written as a long contiguous literal in source - even a comment showing
// an example of the shape being avoided would itself match the same
// scanner. Stripe test API keys get validated against Stripe's own API
// and cleared once confirmed fake, but a webhook signing secret has no
// such live-check, so GitHub can't rule a format-matching one out and
// alerts regardless of how obviously fabricated it is (a plain a-z/0-9
// sequence in an earlier version of this file triggered a real alert).
const fake = (prefix: string, length = 20) => prefix + "x".repeat(length);

describe("looksLikeStripeSecretKey", () => {
  it("accepts a test-mode secret key", () => {
    expect(looksLikeStripeSecretKey(fake("sk_test_"))).toBe(true);
  });

  it("accepts a test-mode restricted key", () => {
    expect(looksLikeStripeSecretKey(fake("rk_test_"))).toBe(true);
  });

  it("rejects a publishable key (the common wrong-key paste)", () => {
    expect(looksLikeStripeSecretKey(fake("pk_test_"))).toBe(false);
  });

  it("rejects a webhook secret pasted into the wrong field", () => {
    expect(looksLikeStripeSecretKey(fake("whsec_"))).toBe(false);
  });

  it("rejects an empty or too-short value", () => {
    expect(looksLikeStripeSecretKey("")).toBe(false);
    expect(looksLikeStripeSecretKey("sk_test_x")).toBe(false);
  });

  it("tolerates surrounding whitespace from a pasted value", () => {
    expect(looksLikeStripeSecretKey(`  ${fake("sk_test_")}  `)).toBe(true);
  });
});

describe("looksLikeStripeWebhookSecret", () => {
  it("accepts a real-shaped webhook secret", () => {
    expect(looksLikeStripeWebhookSecret(fake("whsec_"))).toBe(true);
  });

  it("rejects a secret key pasted into the wrong field", () => {
    expect(looksLikeStripeWebhookSecret(fake("sk_test_"))).toBe(false);
  });

  it("rejects an empty or too-short value", () => {
    expect(looksLikeStripeWebhookSecret("")).toBe(false);
    expect(looksLikeStripeWebhookSecret("whsec_x")).toBe(false);
  });
});
