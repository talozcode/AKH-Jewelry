import { describe, expect, it } from "vitest";
import { DEFAULTS, mergePageContent } from "./pages";

describe("mergePageContent", () => {
  it("returns DEFAULTS untouched when the DB row has no content", () => {
    expect(mergePageContent("faq", undefined)).toEqual(DEFAULTS.faq);
    expect(mergePageContent("faq", null)).toEqual(DEFAULTS.faq);
  });

  it("shallow-merges a partial DB value over DEFAULTS, keeping missing fields", () => {
    const result = mergePageContent("contact", { heading: "Say hello" });
    expect(result.heading).toBe("Say hello");
    // Untouched fields fall back to DEFAULTS, so a partial admin edit never
    // blanks out the rest of the page.
    expect(result.intro).toBe(DEFAULTS.contact.intro);
    expect(result.bodyProse).toBe(DEFAULTS.contact.bodyProse);
  });

  it("lets a full DB row override every field", () => {
    const full = {
      heading: "New heading",
      intro: "New intro",
      bodyProse: "New body",
    };
    expect(mergePageContent("contact", full)).toEqual(full);
  });

  it("does not merge nested arrays element-by-element (shallow merge only)", () => {
    // faq.items is replaced wholesale, not merged item-by-item, since this
    // is a shallow object spread, not a deep merge.
    const result = mergePageContent("faq", { items: [{ question: "Q", answer: "A" }] });
    expect(result.items).toEqual([{ question: "Q", answer: "A" }]);
  });

  it("KNOWN LATENT GAP: an explicit null on a required field in the DB row overrides the default with null, not the fallback", () => {
    // `{...DEFAULTS, ...dbContent}` only falls back to DEFAULTS for a key
    // MISSING from dbContent entirely; a key explicitly present with value
    // `null` (jsonb supports storing null) still wins the spread. Every
    // current admin form binds required string fields to controlled
    // <input>/<textarea> elements, which only ever produce "" (never
    // null), so this isn't reachable through the built UI today - only
    // through a direct/manual DB edit. Documented here as a real fragility
    // in getPage's fallback contract, not fixed, since a proper fix (a
    // per-field null check) adds real complexity for a path nothing in
    // this codebase currently exercises.
    const result = mergePageContent("contact", { heading: null } as unknown as Partial<(typeof DEFAULTS)["contact"]>);
    expect(result.heading).toBeNull();
    expect(result.heading).not.toBe(DEFAULTS.contact.heading);
  });
});
