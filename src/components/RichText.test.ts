import { describe, expect, it } from "vitest";
import { safeHref } from "./RichText";

describe("safeHref", () => {
  it("allows https, http and mailto", () => {
    expect(safeHref("https://stripe.com/legal")).toBe("https://stripe.com/legal");
    expect(safeHref("http://example.com")).toBe("http://example.com");
    expect(safeHref("mailto:hello@akhjewelry.com")).toBe("mailto:hello@akhjewelry.com");
  });

  it("allows a root-relative internal link and returns it unchanged, not resolved to an absolute URL", () => {
    // Regression test: new URL("/privacy") with no base throws, which used
    // to make every internal [text](/path) link in the Terms/Privacy pages
    // silently fall back to unlinked literal text. Verified live in prod
    // before this fix landed.
    expect(safeHref("/privacy")).toBe("/privacy");
    expect(safeHref("/shipping-returns")).toBe("/shipping-returns");
  });

  it("rejects a protocol-relative URL, which is not the same shape as an internal link", () => {
    // "//evil.com" starts with "/" but is a scheme-relative absolute URL,
    // not a same-site path; only exactly one leading "/" is treated as
    // internal.
    expect(safeHref("//evil.com/phish")).toBeNull();
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
