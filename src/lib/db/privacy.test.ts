import { describe, expect, it } from "vitest";
import { buildAnonymizedOrderPatch } from "./privacy";

// The single highest-value test in this codebase's privacy tooling: it
// asserts the patch touches EXACTLY this set of columns, so adding a new
// personal-data column to the orders table later and forgetting to add it
// here fails this test by default, rather than silently shipping a
// "erasure" that leaves the new column untouched. Compliance regressions
// like that are otherwise invisible: nothing else would ever fail.
const EXPECTED_PATCHED_KEYS = [
  "customer_name",
  "customer_email",
  "shipping_line1",
  "shipping_line2",
  "shipping_city",
  "shipping_state",
  "shipping_postal_code",
  "special_instructions",
  "anonymized_at",
].sort();

const base = { id: "abc12345-0000-0000-0000-000000000000", shipping_line2: null, shipping_state: null, special_instructions: null };

describe("buildAnonymizedOrderPatch", () => {
  it("touches exactly the allowlisted personal-data columns, nothing else", () => {
    const patch = buildAnonymizedOrderPatch({ ...base, shipping_line2: "Apt 4", shipping_state: "CA", special_instructions: "Please gift wrap" });
    expect(Object.keys(patch).sort()).toEqual(EXPECTED_PATCHED_KEYS);
  });

  it("erases NOT NULL string columns unconditionally", () => {
    const patch = buildAnonymizedOrderPatch(base);
    expect(patch.customer_name).toBe("[erased]");
    expect(patch.shipping_line1).toBe("[erased]");
    expect(patch.shipping_city).toBe("[erased]");
    expect(patch.shipping_postal_code).toBe("[erased]");
  });

  it("preserves null on nullable columns that had nothing to erase", () => {
    const patch = buildAnonymizedOrderPatch(base);
    expect(patch.shipping_line2).toBeNull();
    expect(patch.shipping_state).toBeNull();
    expect(patch.special_instructions).toBeNull();
  });

  it("erases a present nullable column instead of leaving the real value", () => {
    const patch = buildAnonymizedOrderPatch({ ...base, shipping_line2: "Apt 4", shipping_state: "CA", special_instructions: "Please gift wrap" });
    expect(patch.shipping_line2).toBe("[erased]");
    expect(patch.shipping_state).toBe("[erased]");
  });

  it("erases a gift note/engraving request instead of leaving it readable after 'erasure' - a QA audit found this had been left out", () => {
    const patch = buildAnonymizedOrderPatch({ ...base, special_instructions: "For my mother Sarah, her birthday is March 3rd" });
    expect(patch.special_instructions).toBe("[erased]");
  });

  it("generates a per-row unique, non-routable erased email using the order id", () => {
    const a = buildAnonymizedOrderPatch({ ...base, id: "aaaaaaaa-0000-0000-0000-000000000000" });
    const b = buildAnonymizedOrderPatch({ ...base, id: "bbbbbbbb-0000-0000-0000-000000000000" });
    expect(a.customer_email).not.toBe(b.customer_email);
    expect(a.customer_email.endsWith("@akhjewelry.invalid")).toBe(true);
    expect(a.customer_email).toContain("aaaaaaaa");
  });

  it("stamps anonymized_at with a parseable timestamp", () => {
    const patch = buildAnonymizedOrderPatch(base);
    expect(patch.anonymized_at).not.toBeNull();
    expect(Number.isNaN(new Date(patch.anonymized_at as string).getTime())).toBe(false);
  });
});
