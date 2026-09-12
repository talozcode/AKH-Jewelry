import { describe, expect, it } from "vitest";
import { clearLoginAttempts, isLoginRateLimited, recordFailedLogin } from "./rateLimit";

// Each test uses its own unique key so tests can't contaminate each other
// via the module's shared in-memory bucket map - no reset hook is exposed
// from the module itself (there's no legitimate production reason to reset
// a rate limiter mid-flight, so none was added just for tests).
describe("login rate limiting", () => {
  it("is not limited before any failed attempts", () => {
    expect(isLoginRateLimited("key-fresh")).toBe(false);
  });

  it("is not limited under the threshold", () => {
    const key = "key-under-threshold";
    for (let i = 0; i < 4; i++) recordFailedLogin(key);
    expect(isLoginRateLimited(key)).toBe(false);
  });

  it("becomes limited once the threshold is reached", () => {
    const key = "key-at-threshold";
    for (let i = 0; i < 5; i++) recordFailedLogin(key);
    expect(isLoginRateLimited(key)).toBe(true);
  });

  it("stays limited past the threshold", () => {
    const key = "key-past-threshold";
    for (let i = 0; i < 8; i++) recordFailedLogin(key);
    expect(isLoginRateLimited(key)).toBe(true);
  });

  it("clears on a successful login, un-limiting a key that had hit the threshold", () => {
    const key = "key-cleared";
    for (let i = 0; i < 5; i++) recordFailedLogin(key);
    expect(isLoginRateLimited(key)).toBe(true);
    clearLoginAttempts(key);
    expect(isLoginRateLimited(key)).toBe(false);
  });

  it("tracks each key independently", () => {
    const attacker = "key-attacker";
    const legitimateUser = "key-legit";
    for (let i = 0; i < 5; i++) recordFailedLogin(attacker);
    expect(isLoginRateLimited(attacker)).toBe(true);
    expect(isLoginRateLimited(legitimateUser)).toBe(false);
  });
});
