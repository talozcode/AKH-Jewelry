import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret, maskSecret } from "./secrets";

// Fixtures use generic placeholder strings, not anything shaped like a real
// Stripe key - this module encrypts/masks arbitrary strings, and a
// realistic-looking live-mode key fixture (sk_live_/rk_live_ + a long
// alphanumeric run) is exactly the shape GitHub's push protection flags as
// a possible real secret, fabricated or not.
const TEST_KEY = Buffer.alloc(32, 7).toString("base64"); // deterministic 32-byte key, test-only

describe("encryptSecret / decryptSecret", () => {
  const originalKey = process.env.SETTINGS_ENCRYPTION_KEY;

  beforeEach(() => {
    process.env.SETTINGS_ENCRYPTION_KEY = TEST_KEY;
  });

  afterEach(() => {
    process.env.SETTINGS_ENCRYPTION_KEY = originalKey;
  });

  it("round-trips a secret exactly", () => {
    const secret = "example-secret-value-abcdefghijklmnop";
    expect(decryptSecret(encryptSecret(secret))).toBe(secret);
  });

  it("round-trips a webhook signing secret", () => {
    const secret = "whsec_abcdefghijklmnopqrstuvwxyz0123456789";
    expect(decryptSecret(encryptSecret(secret))).toBe(secret);
  });

  it("produces a different ciphertext each time (random IV per call), even for the same input", () => {
    const secret = "sameinputtwice";
    expect(encryptSecret(secret)).not.toBe(encryptSecret(secret));
  });

  it("throws rather than returning garbage when the ciphertext has been tampered with", () => {
    const stored = encryptSecret("example-untampered-value");
    const [iv, authTag, ciphertext] = stored.split(".");
    // Flip the ciphertext to simulate corruption/tampering - GCM's auth tag
    // must catch this, not silently decrypt to different plaintext.
    const tampered = [iv, authTag, Buffer.from(ciphertext, "base64").reverse().toString("base64")].join(".");
    expect(() => decryptSecret(tampered)).toThrow();
  });

  it("throws on a malformed stored value instead of guessing", () => {
    expect(() => decryptSecret("not-the-right-shape")).toThrow(/malformed/);
  });

  it("throws when the encryption key is unset (fails closed, never encrypts under a missing key)", () => {
    delete process.env.SETTINGS_ENCRYPTION_KEY;
    expect(() => encryptSecret("example-value")).toThrow(/SETTINGS_ENCRYPTION_KEY/);
  });

  it("throws when the encryption key is the wrong length", () => {
    process.env.SETTINGS_ENCRYPTION_KEY = Buffer.alloc(16, 1).toString("base64"); // 16 bytes, not 32
    expect(() => encryptSecret("example-value")).toThrow(/32 bytes/);
  });

  it("cannot decrypt a secret encrypted under a different key", () => {
    const stored = encryptSecret("example-value-under-key-one");
    process.env.SETTINGS_ENCRYPTION_KEY = Buffer.alloc(32, 9).toString("base64"); // a different key
    expect(() => decryptSecret(stored)).toThrow();
  });
});

describe("maskSecret", () => {
  it("keeps a recognizable prefix and suffix for a longer value", () => {
    expect(maskSecret("example-secret-value-abcdefghijklmnop")).toBe("example-…mnop");
  });

  it("keeps a recognizable prefix and suffix for a webhook secret", () => {
    expect(maskSecret("whsec_abcdefghijklmnopqrstuvwxyz")).toBe("whsec_ab…wxyz");
  });

  it("never reveals the full value even for a very short input", () => {
    const masked = maskSecret("short");
    expect(masked).not.toContain("short");
    expect(masked).toBe("•".repeat(5));
  });

  it("trims surrounding whitespace before masking, matching a pasted-with-a-trailing-newline value", () => {
    expect(maskSecret("  example-secret-value-abcdefghijklmnop  ")).toBe("example-…mnop");
  });
});
