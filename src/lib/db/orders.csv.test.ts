import { describe, expect, it } from "vitest";
import { ordersToCsv, type Order } from "./orders";

function fakeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: "order-1",
    product_id: "product-1",
    product_name: "Anemone Ring",
    product_slug: "anemone",
    product_price: 120000,
    product_currency: "ILS",
    size: null,
    customer_name: "Jane Doe",
    customer_email: "jane@example.com",
    shipping_line1: "1 Main St",
    shipping_line2: null,
    shipping_city: "Tel Aviv",
    shipping_state: null,
    shipping_postal_code: "1234567",
    shipping_country: "IL",
    stripe_checkout_session_id: "cs_123",
    stripe_payment_intent_id: "pi_123",
    amount_total: 120000,
    currency: "ILS",
    status: "unfulfilled",
    stripe_refund_id: null,
    refunded_at: null,
    amount_refunded: 0,
    oversold: false,
    anonymized_at: null,
    created_at: "2026-09-01T12:00:00.000Z",
    updated_at: "2026-09-01T12:00:00.000Z",
    ...overrides,
  };
}

describe("ordersToCsv", () => {
  it("includes a header row and one row per order", () => {
    const csv = ordersToCsv([fakeOrder()]);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe(
      "Date,Order ID,Product,Size,Customer name,Customer email,Amount,Currency,Refunded,Status,Oversold,Shipping address,City,State,Postal code,Country"
    );
  });

  it("converts amounts from smallest-currency-unit integers to decimal", () => {
    const csv = ordersToCsv([fakeOrder({ amount_total: 120050, amount_refunded: 5000 })]);
    expect(csv).toContain("1200.50,ILS,50.00");
  });

  it("formats the date as a plain ISO date, not a full timestamp", () => {
    const csv = ordersToCsv([fakeOrder({ created_at: "2026-09-01T23:59:59.000Z" })]);
    expect(csv.split("\n")[1].startsWith("2026-09-01,")).toBe(true);
  });

  it("quotes a field containing a comma", () => {
    const csv = ordersToCsv([fakeOrder({ customer_name: "Doe, Jane" })]);
    expect(csv).toContain('"Doe, Jane"');
  });

  it("quotes and escapes a field containing a double quote", () => {
    const csv = ordersToCsv([fakeOrder({ customer_name: 'Jane "JD" Doe' })]);
    expect(csv).toContain('"Jane ""JD"" Doe"');
  });

  it("does not quote a field with no special characters", () => {
    const csv = ordersToCsv([fakeOrder({ customer_name: "Jane Doe" })]);
    expect(csv.split("\n")[1]).not.toContain('"Jane Doe"');
  });

  it("joins shipping_line1 and shipping_line2 with a comma when both are present", () => {
    const csv = ordersToCsv([fakeOrder({ shipping_line1: "1 Main St", shipping_line2: "Apt 4" })]);
    expect(csv).toContain('"1 Main St, Apt 4"');
  });

  it("marks oversold orders", () => {
    const csv = ordersToCsv([fakeOrder({ oversold: true })]);
    expect(csv.split("\n")[1]).toContain(",yes,");
  });

  it("leaves the oversold column blank for a normal order", () => {
    const csv = ordersToCsv([fakeOrder({ oversold: false })]);
    const cols = csv.split("\n")[1].split(",");
    expect(cols[10]).toBe("");
  });

  it("returns just the header for an empty order list", () => {
    const csv = ordersToCsv([]);
    expect(csv.split("\n")).toHaveLength(1);
  });
});
