import { describe, expect, it } from "vitest";
import { looksLikeStripeSecretKey, looksLikeStripeWebhookSecret } from "./stripe";

// Fixtures deliberately use only sk_test_/rk_test_-shaped values, never a
// live-mode prefix followed by a long alphanumeric run - GitHub's push
// protection flags that shape as a possible real Stripe key regardless of
// whether it's fabricated. looksLikeStripeSecretKey()'s "test|live"
// alternation is a one-word difference in the pattern itself, so exercising
// "test" here covers it without needing a live-shaped fixture at all.
describe("looksLikeStripeSecretKey", () => {
  it("accepts a test-mode secret key", () => {
    expect(looksLikeStripeSecretKey("sk_test_51NabcdEFGHijklMNOPqrstUVWXyz")).toBe(true);
  });

  it("accepts a test-mode restricted key", () => {
    expect(looksLikeStripeSecretKey("rk_test_51NabcdEFGHijklMNOPqrstUVWXyz")).toBe(true);
  });

  it("rejects a publishable key (the common wrong-key paste)", () => {
    expect(looksLikeStripeSecretKey("pk_test_51NabcdEFGHijklMNOPqrstUVWXyz")).toBe(false);
  });

  it("rejects a webhook secret pasted into the wrong field", () => {
    expect(looksLikeStripeSecretKey("whsec_abcdefghijklmnopqrstuvwxyz")).toBe(false);
  });

  it("rejects an empty or too-short value", () => {
    expect(looksLikeStripeSecretKey("")).toBe(false);
    expect(looksLikeStripeSecretKey("sk_test_x")).toBe(false);
  });

  it("tolerates surrounding whitespace from a pasted value", () => {
    expect(looksLikeStripeSecretKey("  sk_test_51NabcdEFGHijklMNOPqrstUVWXyz  ")).toBe(true);
  });
});

describe("looksLikeStripeWebhookSecret", () => {
  it("accepts a real-shaped webhook secret", () => {
    expect(looksLikeStripeWebhookSecret("whsec_abcdefghijklmnopqrstuvwxyz0123456789")).toBe(true);
  });

  it("rejects a secret key pasted into the wrong field", () => {
    expect(looksLikeStripeWebhookSecret("sk_test_51NabcdEFGHijklMNOPqrstUVWXyz")).toBe(false);
  });

  it("rejects an empty or too-short value", () => {
    expect(looksLikeStripeWebhookSecret("")).toBe(false);
    expect(looksLikeStripeWebhookSecret("whsec_x")).toBe(false);
  });
});
