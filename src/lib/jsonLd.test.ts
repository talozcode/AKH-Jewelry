import { describe, expect, it } from "vitest";
import { jsonLdScript } from "./jsonLd";

describe("jsonLdScript", () => {
  it("serializes an ordinary object exactly like JSON.stringify", () => {
    expect(jsonLdScript({ name: "Ring", price: 900 })).toBe(JSON.stringify({ name: "Ring", price: 900 }));
  });

  it("escapes < so an admin-entered value containing </script> can't break out of the script tag", () => {
    // A product name/description has no length or character restriction in
    // ProductForm - a QA audit found this was the exact "admin credential
    // leak -> stored XSS on every storefront page" threat model CLAUDE.md
    // already documents for RichText.tsx, but this sink wasn't covered.
    const malicious = jsonLdScript({ name: "Ring</script><script>alert(1)</script>" });
    expect(malicious).not.toContain("</script>");
    expect(malicious).toContain("\\u003c/script>");
  });

  it("round-trips back to the original value through JSON.parse, proving the escape is invisible to consumers", () => {
    const data = { name: "Ring</script>" };
    expect(JSON.parse(jsonLdScript(data))).toEqual(data);
  });
});
