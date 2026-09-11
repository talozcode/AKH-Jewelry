import { afterEach, describe, expect, it, vi } from "vitest";
import { tokenMatches } from "./auth";

// tokenMatches reads process.env.ADMIN_TOKEN directly (see auth.ts), so each
// test stubs it explicitly rather than relying on whatever .env.local has
// loaded, and restores it afterward so tests don't leak state into each other.
afterEach(() => {
  vi.unstubAllEnvs();
});

describe("tokenMatches", () => {
  it("matches the correct token", () => {
    vi.stubEnv("ADMIN_TOKEN", "correct-token");
    expect(tokenMatches("correct-token")).toBe(true);
  });

  it("rejects an incorrect token", () => {
    vi.stubEnv("ADMIN_TOKEN", "correct-token");
    expect(tokenMatches("wrong-token")).toBe(false);
  });

  it("fails closed when ADMIN_TOKEN is unset, even if a token is provided", () => {
    vi.stubEnv("ADMIN_TOKEN", undefined);
    expect(tokenMatches("anything")).toBe(false);
  });

  it("fails closed when no cookie value is provided", () => {
    vi.stubEnv("ADMIN_TOKEN", "correct-token");
    expect(tokenMatches(undefined)).toBe(false);
  });

  it("fails closed when both are unset", () => {
    vi.stubEnv("ADMIN_TOKEN", undefined);
    expect(tokenMatches(undefined)).toBe(false);
  });
});
