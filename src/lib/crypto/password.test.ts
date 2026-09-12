import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("hashPassword / verifyPassword", () => {
  it("verifies the correct password against its own hash", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(await verifyPassword("correct horse battery staple", hash)).toBe(true);
  });

  it("rejects the wrong password", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(await verifyPassword("wrong password", hash)).toBe(false);
  });

  it("produces a different hash each time (random salt), even for the same password", async () => {
    const a = await hashPassword("same-password");
    const b = await hashPassword("same-password");
    expect(a).not.toBe(b);
    expect(await verifyPassword("same-password", a)).toBe(true);
    expect(await verifyPassword("same-password", b)).toBe(true);
  });

  it("rejects a malformed stored value instead of throwing", async () => {
    expect(await verifyPassword("anything", "not-the-right-shape")).toBe(false);
  });

  it("is case- and whitespace-sensitive", async () => {
    const hash = await hashPassword("Password123");
    expect(await verifyPassword("password123", hash)).toBe(false);
    expect(await verifyPassword("Password123 ", hash)).toBe(false);
  });
});
