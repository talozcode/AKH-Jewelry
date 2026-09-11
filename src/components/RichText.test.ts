import { describe, expect, it } from "vitest";
import { isExternalHref, safeHref } from "./RichText";

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

  it("accepts an uppercase-protocol URL, since new URL() normalizes the scheme before checking it", () => {
    expect(safeHref("HTTPS://EXAMPLE.COM")).toBe("HTTPS://EXAMPLE.COM");
  });

  it("accepts a mailto: link with a query string (subject/body params)", () => {
    expect(safeHref("mailto:hello@akhjewelry.com?subject=Order%20question")).toBe(
      "mailto:hello@akhjewelry.com?subject=Order%20question"
    );
  });

  it("accepts an https: URL carrying userinfo, since the protocol is still https:", () => {
    // Not a vector this component defends against: safeHref's whole job is
    // blocking code-executing schemes, not policing what a legitimate
    // https:/http:/mailto: URL is allowed to contain.
    expect(safeHref("https://user:pass@example.com")).toBe("https://user:pass@example.com");
  });
});

describe("isExternalHref", () => {
  it("treats plain https/http as external", () => {
    expect(isExternalHref("https://stripe.com")).toBe(true);
    expect(isExternalHref("http://example.com")).toBe(true);
  });

  it("treats an uppercase or mixed-case protocol as external too", () => {
    // Regression test: safeHref accepts "HTTPS://EXAMPLE.COM" verbatim
    // (case preserved), so the external-link check has to be
    // case-insensitive on the scheme too, or such a link would silently
    // lose target="_blank"/rel="noreferrer" despite pointing off-site.
    expect(isExternalHref("HTTPS://EXAMPLE.COM")).toBe(true);
    expect(isExternalHref("HtTpS://example.com")).toBe(true);
  });

  it("does not treat a root-relative internal link as external", () => {
    expect(isExternalHref("/privacy")).toBe(false);
    expect(isExternalHref("/shipping-returns")).toBe(false);
  });

  it("does not treat mailto: as external", () => {
    expect(isExternalHref("mailto:hello@akhjewelry.com")).toBe(false);
  });
});
