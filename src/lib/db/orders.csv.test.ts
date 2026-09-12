import { describe, expect, it } from "vitest";
import { ordersToCsv, type Order, type OrderItem, type OrderWithItems } from "./orders";

function fakeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: "order-1",
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
    anonymized_at: null,
    created_at: "2026-09-01T12:00:00.000Z",
    updated_at: "2026-09-01T12:00:00.000Z",
    ...overrides,
  };
}

function fakeItem(overrides: Partial<OrderItem> = {}): OrderItem {
  return {
    id: "item-1",
    order_id: "order-1",
    product_id: "product-1",
    product_name: "Anemone Ring",
    product_slug: "anemone",
    unit_amount: 120000,
    size: null,
    quantity: 1,
    oversold: false,
    created_at: "2026-09-01T12:00:00.000Z",
    ...overrides,
  };
}

function withItems(order: Order, items: OrderItem[]): OrderWithItems {
  return { ...order, items };
}

describe("ordersToCsv", () => {
  it("includes a header row and one row per order item", () => {
    const csv = ordersToCsv([withItems(fakeOrder(), [fakeItem()])]);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe(
      "Date,Order ID,Product,Size,Quantity,Customer name,Customer email,Item amount,Order total,Currency,Refunded,Status,Oversold,Shipping address,City,State,Postal code,Country"
    );
  });

  it("emits one row per item for a multi-item order", () => {
    const csv = ordersToCsv([
      withItems(fakeOrder({ amount_total: 200000 }), [
        fakeItem({ id: "item-1", product_name: "Anemone Ring", unit_amount: 120000, quantity: 1 }),
        fakeItem({ id: "item-2", product_name: "Bondl Necklace", unit_amount: 80000, quantity: 1 }),
      ]),
    ]);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[1]).toContain("Anemone Ring");
    expect(lines[2]).toContain("Bondl Necklace");
    // Order total repeats on every row of the same order, not just once.
    expect(lines[1]).toContain("2000.00");
    expect(lines[2]).toContain("2000.00");
  });

  it("multiplies unit amount by quantity for the item amount column", () => {
    const csv = ordersToCsv([withItems(fakeOrder(), [fakeItem({ unit_amount: 50000, quantity: 3 })])]);
    const cols = csv.split("\n")[1].split(",");
    expect(cols[7]).toBe("1500.00"); // Item amount
  });

  it("converts amounts from smallest-currency-unit integers to decimal", () => {
    const csv = ordersToCsv([withItems(fakeOrder({ amount_total: 120050, amount_refunded: 5000 }), [fakeItem()])]);
    expect(csv).toContain("ILS,50.00");
    expect(csv).toContain("1200.50");
  });

  it("formats the date as a plain ISO date, not a full timestamp", () => {
    const csv = ordersToCsv([withItems(fakeOrder({ created_at: "2026-09-01T23:59:59.000Z" }), [fakeItem()])]);
    expect(csv.split("\n")[1].startsWith("2026-09-01,")).toBe(true);
  });

  it("quotes a field containing a comma", () => {
    const csv = ordersToCsv([withItems(fakeOrder({ customer_name: "Doe, Jane" }), [fakeItem()])]);
    expect(csv).toContain('"Doe, Jane"');
  });

  it("quotes and escapes a field containing a double quote", () => {
    const csv = ordersToCsv([withItems(fakeOrder({ customer_name: 'Jane "JD" Doe' }), [fakeItem()])]);
    expect(csv).toContain('"Jane ""JD"" Doe"');
  });

  it("joins shipping_line1 and shipping_line2 with a comma when both are present", () => {
    const csv = ordersToCsv([withItems(fakeOrder({ shipping_line1: "1 Main St", shipping_line2: "Apt 4" }), [fakeItem()])]);
    expect(csv).toContain('"1 Main St, Apt 4"');
  });

  it("marks an oversold item", () => {
    const csv = ordersToCsv([withItems(fakeOrder(), [fakeItem({ oversold: true })])]);
    expect(csv.split("\n")[1]).toContain(",yes,");
  });

  it("leaves the oversold column blank for a normal item", () => {
    const csv = ordersToCsv([withItems(fakeOrder(), [fakeItem({ oversold: false })])]);
    const cols = csv.split("\n")[1].split(",");
    expect(cols[12]).toBe("");
  });

  it("still emits one row for an order with no items (a genuinely reachable data anomaly, not something to hide)", () => {
    const csv = ordersToCsv([withItems(fakeOrder(), [])]);
    expect(csv.split("\n")).toHaveLength(2);
  });

  it("returns just the header for an empty order list", () => {
    const csv = ordersToCsv([]);
    expect(csv.split("\n")).toHaveLength(1);
  });
});
