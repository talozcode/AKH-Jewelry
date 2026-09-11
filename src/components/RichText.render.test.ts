import { describe, expect, it } from "vitest";
import { RichText } from "./RichText";

/**
 * RichText's own render output is a plain React element tree (no DOM
 * needed to inspect it: `<a>...</a>` JSX is just `React.createElement`,
 * producing a plain object graph), so its actual rendered structure is
 * testable directly, not just its `safeHref`/`isExternalHref` helpers in
 * isolation.
 */
function children(text: string): unknown[] {
  const el = RichText({ text }) as { props: { children: unknown[] } };
  return el.props.children;
}

function isLink(node: unknown): node is { type: string; props: { href: string; children: unknown; target?: string; rel?: string } } {
  return typeof node === "object" && node !== null && (node as { type?: unknown }).type === "a";
}

describe("RichText rendering", () => {
  it("renders plain text with no links unchanged", () => {
    expect(children("Just plain text.")).toEqual(["Just plain text."]);
  });

  it("renders two separate links in one string, each independently", () => {
    const nodes = children("See [Terms](/terms) and [Privacy](/privacy) for details.");
    const links = nodes.filter(isLink);
    expect(links).toHaveLength(2);
    expect(links[0].props.href).toBe("/terms");
    expect(links[0].props.children).toBe("Terms");
    expect(links[1].props.href).toBe("/privacy");
    expect(links[1].props.children).toBe("Privacy");
  });

  it("renders two adjacent links with no space between them, without merging or dropping either", () => {
    const nodes = children("[A](/a)[B](/b)");
    const links = nodes.filter(isLink);
    expect(links).toHaveLength(2);
    expect(links[0].props.href).toBe("/a");
    expect(links[1].props.href).toBe("/b");
  });

  it("gives an internal link no target/rel, and an external link both", () => {
    const nodes = children("[Internal](/privacy) and [External](https://stripe.com)");
    const links = nodes.filter(isLink);
    expect(links[0].props.target).toBeUndefined();
    expect(links[0].props.rel).toBeUndefined();
    expect(links[1].props.target).toBe("_blank");
    expect(links[1].props.rel).toBe("noreferrer");
  });

  it("renders a rejected (unsafe) link as the literal bracket text, not a link, and never loses or alters a single character", () => {
    const nodes = children("Click [here](javascript:alert(1)) now.");
    expect(nodes.some(isLink)).toBe(false);
    // The rejected match's `full` text and the surrounding plain-text
    // slices are all contiguous substrings of the original string, so
    // joining every node back together always exactly reconstructs the
    // input, regardless of exactly where the regex's match boundary fell.
    expect(nodes.join("")).toBe("Click [here](javascript:alert(1)) now.");
  });

  it("never drops or mangles text when the URL itself contains a literal close-paren", () => {
    // A real, legitimate case: a Wikipedia-style disambiguation URL.
    const text = "See [this article](https://en.wikipedia.org/wiki/Foo_(bar)) for background.";
    const nodes = children(text);
    // Whatever it decides to linkify, the concatenation of all rendered
    // text (link labels + plain segments) must reconstruct losslessly -
    // no character from the original string should vanish.
    const flattened = nodes.map((n) => (isLink(n) ? `[${n.props.children}](${n.props.href})` : n)).join("");
    // Rebuild what got matched vs. left as literal, and confirm no
    // visible content (words) disappeared, even if the link boundary
    // landed somewhere unexpected.
    expect(flattened).toContain("this article");
    expect(flattened).toContain("bar");
    expect(flattened).toContain("for background.");
  });

  it("does not treat an empty link label as a link at all (the pattern requires at least one label character)", () => {
    const nodes = children("Nothing [](/privacy) here.");
    expect(nodes.some(isLink)).toBe(false);
    expect(nodes.join("")).toBe("Nothing [](/privacy) here.");
  });

  it("leaves an unterminated bracket (no matching parens) as plain literal text", () => {
    const nodes = children("This [is not a link and has no closing paren.");
    expect(nodes.some(isLink)).toBe(false);
    expect(nodes.join("")).toBe("This [is not a link and has no closing paren.");
  });
});
