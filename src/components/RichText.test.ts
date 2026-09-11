import { describe, expect, it } from "vitest";
import { safeHref } from "./RichText";

describe("safeHref", () => {
  it("allows https, http and mailto", () => {
    expect(safeHref("https://stripe.com/legal")).toBe("https://stripe.com/legal");
    expect(safeHref("http://example.com")).toBe("http://example.com");
    expect(safeHref("mailto:hello@akhjewelry.com")).toBe("mailto:hello@akhjewelry.com");
  });

  it("rejects javascript: URLs", () => {
    expect(safeHref("javascript:alert(1)")).toBeNull();
  });

  it("rejects javascript: with mixed case, since new URL() normalizes protocol case", () => {
    expect(safeHref("JaVaScRiPt:alert(1)")).toBeNull();
  });

  it("rejects javascript: hidden behind a tab, which a naive startsWith() check would miss", () => {
    // WHATWG URL parsing strips ASCII tab/newline from the whole URL before
    // reading the scheme, so this still normalizes to a plain javascript: URL.
    expect(safeHref("java\tscript:alert(1)")).toBeNull();
  });

  it("rejects data: and other unlisted protocols", () => {
    expect(safeHref("data:text/html,<script>alert(1)</script>")).toBeNull();
  });

  it("rejects unparseable strings instead of throwing", () => {
    expect(safeHref("not a url")).toBeNull();
    expect(safeHref("")).toBeNull();
  });
});
