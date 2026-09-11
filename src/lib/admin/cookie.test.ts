import { describe, expect, it } from "vitest";
import { safeEqual } from "./cookie";

describe("safeEqual", () => {
  it("matches identical strings", () => {
    expect(safeEqual("akh-studio-2026", "akh-studio-2026")).toBe(true);
  });

  it("rejects a different value of the same length", () => {
    expect(safeEqual("akh-studio-2026", "akh-studio-2027")).toBe(false);
  });

  it("rejects a different length without throwing", () => {
    expect(safeEqual("short", "much-longer-value")).toBe(false);
  });

  it("treats empty strings as equal to each other", () => {
    expect(safeEqual("", "")).toBe(true);
  });

  it("rejects an empty string against a non-empty one", () => {
    expect(safeEqual("", "x")).toBe(false);
  });
});
