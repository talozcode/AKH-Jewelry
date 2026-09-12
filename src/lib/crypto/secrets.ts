import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
// 96 bits: the size GCM is designed and recommended for (NIST SP 800-38D) -
// not an arbitrary choice, and not the same thing as the 256-bit key itself.
const IV_LENGTH = 12;

function encryptionKey(): Buffer {
  const raw = process.env.SETTINGS_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "SETTINGS_ENCRYPTION_KEY is not set. Generate one with `openssl rand -base64 32` and add it to .env.local and the Vercel project's env vars (see CLAUDE.md's Payments settings section)."
    );
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error(
      "SETTINGS_ENCRYPTION_KEY must decode to exactly 32 bytes (base64 of a 256-bit key) - generate one with `openssl rand -base64 32`."
    );
  }
  return key;
}

/**
 * Encrypts a secret (a Stripe API key, a webhook signing secret) before it's
 * ever written to the database. AES-256-GCM is authenticated encryption: a
 * tampered or corrupted ciphertext fails to decrypt with a thrown error
 * rather than silently returning garbage as if it were a real key. A fresh
 * random IV is generated on every call and stored alongside the ciphertext
 * (never reused/derived) - GCM's confidentiality guarantee depends entirely
 * on never using the same IV twice under the same key.
 *
 * Stored format: base64(iv) + "." + base64(authTag) + "." + base64(ciphertext).
 * "." is safe as a delimiter - it never appears in base64 output.
 */
export function encryptSecret(plaintext: string): string {
  const key = encryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv, authTag, ciphertext].map((buf) => buf.toString("base64")).join(".");
}

/** Reverses encryptSecret(). Throws (rather than returning something
 *  plausible-looking) on a malformed or tampered stored value. */
export function decryptSecret(stored: string): string {
  const key = encryptionKey();
  const parts = stored.split(".");
  if (parts.length !== 3) {
    throw new Error("Stored secret is malformed - expected iv.authTag.ciphertext.");
  }
  const [ivB64, authTagB64, ciphertextB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const ciphertext = Buffer.from(ciphertextB64, "base64");
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString("utf8");
}

/**
 * A short, safe-to-redisplay fingerprint of a secret (e.g. "sk_live_5…wXyz")
 * - enough for the owner to visually confirm "yes, that's the key I just
 * pasted" without the real value ever being sent back to the browser again.
 * One-way: there is no function that recovers the original from this.
 */
export function maskSecret(plaintext: string): string {
  const trimmed = plaintext.trim();
  if (trimmed.length <= 12) return "•".repeat(trimmed.length);
  return `${trimmed.slice(0, 8)}…${trimmed.slice(-4)}`;
}
