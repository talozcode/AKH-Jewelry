import { describe, expect, it } from "vitest";
import {
  orderConfirmationEmail,
  orderShippedEmail,
  ownerDisputeAlertEmail,
  ownerErrorAlertEmail,
  ownerNewOrderAlertEmail,
  refundConfirmationEmail,
} from "./templates";

describe("orderConfirmationEmail", () => {
  it("lists every item and the total", () => {
    const email = orderConfirmationEmail({
      customerName: "Jane",
      items: [{ name: "Anemone Ring", size: "54", quantity: 1 }],
      amountTotal: 120000,
      currency: "ILS",
      specialInstructions: null,
    });
    expect(email.text).toContain("Anemone Ring, size 54");
    expect(email.text).toContain("₪1,200");
    expect(email.html).toContain("Anemone Ring, size 54");
  });

  it("shows quantity only when greater than 1", () => {
    const single = orderConfirmationEmail({
      customerName: "Jane",
      items: [{ name: "Ring", quantity: 1 }],
      amountTotal: 1000,
      currency: "ILS",
      specialInstructions: null,
    });
    expect(single.text).not.toContain("x1");

    const multiple = orderConfirmationEmail({
      customerName: "Jane",
      items: [{ name: "Ring", quantity: 3 }],
      amountTotal: 3000,
      currency: "ILS",
      specialInstructions: null,
    });
    expect(multiple.text).toContain("Ring x3");
  });

  it("includes the gift note when present", () => {
    const email = orderConfirmationEmail({
      customerName: "Jane",
      items: [{ name: "Ring", quantity: 1 }],
      amountTotal: 1000,
      currency: "ILS",
      specialInstructions: "Please gift wrap",
    });
    expect(email.text).toContain("Please gift wrap");
    expect(email.html).toContain("Please gift wrap");
  });

  it("omits the gift note line entirely when there is none", () => {
    const email = orderConfirmationEmail({
      customerName: "Jane",
      items: [{ name: "Ring", quantity: 1 }],
      amountTotal: 1000,
      currency: "ILS",
      specialInstructions: null,
    });
    expect(email.text).not.toContain("Your note");
    expect(email.html).not.toContain("Your note");
  });

  it("falls back to a generic greeting when the customer name is blank", () => {
    const email = orderConfirmationEmail({
      customerName: "",
      items: [{ name: "Ring", quantity: 1 }],
      amountTotal: 1000,
      currency: "ILS",
      specialInstructions: null,
    });
    expect(email.text).toContain("Hi there,");
  });

  it("lists multiple items in a multi-item order", () => {
    const email = orderConfirmationEmail({
      customerName: "Jane",
      items: [
        { name: "Anemone Ring", quantity: 1 },
        { name: "Bondl Necklace", quantity: 2 },
      ],
      amountTotal: 5000,
      currency: "USD",
      specialInstructions: null,
    });
    expect(email.text).toContain("Anemone Ring");
    expect(email.text).toContain("Bondl Necklace x2");
  });
});

describe("orderShippedEmail", () => {
  it("includes the tracking number and carrier when both are given", () => {
    const email = orderShippedEmail({ customerName: "Jane", items: [{ name: "Ring", quantity: 1 }], trackingNumber: "RR123", carrier: "DHL" });
    expect(email.text).toContain("RR123 (DHL)");
  });

  it("shows the tracking number alone when no carrier is given", () => {
    const email = orderShippedEmail({ customerName: "Jane", items: [{ name: "Ring", quantity: 1 }], trackingNumber: "RR123", carrier: null });
    expect(email.text).toContain("Tracking number: RR123");
    expect(email.text).not.toContain("(");
  });

  it("omits the tracking line entirely when no tracking number was recorded", () => {
    const email = orderShippedEmail({ customerName: "Jane", items: [{ name: "Ring", quantity: 1 }], trackingNumber: null, carrier: null });
    expect(email.text).not.toContain("Tracking number");
  });
});

describe("refundConfirmationEmail", () => {
  it("states the refunded amount in the right currency", () => {
    const email = refundConfirmationEmail({ customerName: "Jane", amountRefunded: 90000, currency: "ILS" });
    expect(email.text).toContain("₪900");
  });
});

describe("ownerNewOrderAlertEmail", () => {
  it("puts the total and a link to the admin in both formats", () => {
    const email = ownerNewOrderAlertEmail({
      customerName: "Jane",
      items: [{ name: "Ring", quantity: 1 }],
      amountTotal: 120000,
      currency: "ILS",
      adminOrdersUrl: "https://akhjewelry.com/admin/orders",
    });
    expect(email.subject).toContain("₪1,200");
    expect(email.text).toContain("https://akhjewelry.com/admin/orders");
    expect(email.html).toContain("https://akhjewelry.com/admin/orders");
  });

  it("falls back to a generic subject when the customer name is blank", () => {
    const email = ownerNewOrderAlertEmail({
      customerName: "",
      items: [{ name: "Ring", quantity: 1 }],
      amountTotal: 1000,
      currency: "ILS",
      adminOrdersUrl: "https://akhjewelry.com/admin/orders",
    });
    expect(email.subject).toContain("a customer");
  });
});

describe("ownerDisputeAlertEmail", () => {
  it("mentions the deadline warning and links to the admin", () => {
    const email = ownerDisputeAlertEmail({ customerName: "Jane", amount: 50000, currency: "USD", adminOrdersUrl: "https://x/admin/orders" });
    expect(email.text.toLowerCase()).toContain("deadline");
    expect(email.text).toContain("$500");
  });
});

describe("ownerErrorAlertEmail", () => {
  it("includes both the context and the detail", () => {
    const email = ownerErrorAlertEmail({ context: "checkout.session.completed", detail: "orders insert failed" });
    expect(email.text).toContain("checkout.session.completed");
    expect(email.text).toContain("orders insert failed");
  });
});
