import { describe, expect, it } from "vitest";
import { isDuplicateSessionError, sessionToOrderRow } from "./orders";

// Test fixtures only need the subset of fields sessionToOrderRow actually
// reads (its param type is a Pick<...>), so each literal is cast rather
// than filling in every unrelated required field of Stripe's real
// Session/CustomerDetails types.
type SessionInput = Parameters<typeof sessionToOrderRow>[0];

describe("sessionToOrderRow", () => {
  it("maps a full session with shipping details to the expected header row shape", () => {
    const session = {
      id: "cs_test_1",
      payment_intent: "pi_test_1",
      customer_details: { name: "Jane Doe", email: "jane@example.com" },
      collected_information: {
        shipping_details: {
          address: { line1: "1 Main St", line2: "Apt 4", city: "Tel Aviv", state: null, postal_code: "12345", country: "IL" },
        },
      },
      amount_total: 90000,
      currency: "ils",
    } as SessionInput;

    const row = sessionToOrderRow(session);

    expect(row).toEqual({
      customer_name: "Jane Doe",
      customer_email: "jane@example.com",
      shipping_line1: "1 Main St",
      shipping_line2: "Apt 4",
      shipping_city: "Tel Aviv",
      shipping_state: null,
      shipping_postal_code: "12345",
      shipping_country: "IL",
      stripe_checkout_session_id: "cs_test_1",
      stripe_payment_intent_id: "pi_test_1",
      amount_total: 90000,
      currency: "ILS",
    });
  });

  it("fills every NOT NULL shipping/customer field with empty strings, never undefined, when shipping details are missing", () => {
    // Stripe doesn't guarantee collected_information.shipping_details is
    // present on every completed session shape; these columns are all
    // NOT NULL on the orders table.
    const session = {
      id: "cs_test_2",
      payment_intent: null,
      customer_details: null,
      collected_information: null,
      amount_total: null,
      currency: null,
    } as SessionInput;

    const row = sessionToOrderRow(session);

    expect(row.customer_name).toBe("");
    expect(row.customer_email).toBe("");
    expect(row.shipping_line1).toBe("");
    expect(row.shipping_city).toBe("");
    expect(row.shipping_postal_code).toBe("");
    expect(row.shipping_country).toBe("");
    // Nullable columns stay null, not "".
    expect(row.shipping_line2).toBeNull();
    expect(row.shipping_state).toBeNull();
    expect(row.stripe_payment_intent_id).toBeNull();
    // No values anywhere are undefined (would be dropped from a Supabase
    // insert instead of sent as null/"").
    expect(Object.values(row).some((v) => v === undefined)).toBe(false);
  });

  it("falls back to ILS when the session has no currency at all", () => {
    // Unlike the old single-product version, there's no per-product
    // currency to fall back to here - currency now lives only on the
    // order header, one Checkout Session = one currency for every line
    // item in it, so ILS (the shop's primary currency) is the sane
    // last-resort default rather than guessing from a product.
    const session = {
      id: "cs_test_3",
      payment_intent: null,
      customer_details: null,
      collected_information: null,
      amount_total: 90000,
      currency: null,
    } as SessionInput;
    expect(sessionToOrderRow(session).currency).toBe("ILS");
  });

  it("extracts a string payment_intent id directly, not the id of an expanded object", () => {
    const session = {
      id: "cs_test_4",
      payment_intent: "pi_direct",
      customer_details: null,
      collected_information: null,
      amount_total: 0,
      currency: null,
    } as SessionInput;
    expect(sessionToOrderRow(session).stripe_payment_intent_id).toBe("pi_direct");
  });

  it("defaults amount_total to 0 rather than null/undefined when Stripe omits it", () => {
    const session = {
      id: "cs_test_5",
      payment_intent: null,
      customer_details: null,
      collected_information: null,
      amount_total: null,
      currency: null,
    } as SessionInput;
    expect(sessionToOrderRow(session).amount_total).toBe(0);
  });
});

describe("isDuplicateSessionError", () => {
  it("recognizes a Postgres unique_violation (23505)", () => {
    expect(isDuplicateSessionError({ code: "23505" })).toBe(true);
  });

  it("does not treat other error codes as a duplicate", () => {
    expect(isDuplicateSessionError({ code: "23503" })).toBe(false);
  });

  it("handles a missing/null error safely", () => {
    expect(isDuplicateSessionError(null)).toBe(false);
    expect(isDuplicateSessionError(undefined)).toBe(false);
  });
});
