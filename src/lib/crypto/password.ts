import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/**
 * Hashes the admin login password for storage. Deliberately different from
 * encryptSecret()/decryptSecret() in ./secrets.ts: those are reversible
 * (Stripe's key must be recovered in full to call Stripe with it), but a
 * login password should never be recoverable by this app itself, only
 * verifiable - one-way scrypt with a random salt per password, Node's
 * built-in implementation rather than adding bcrypt/argon2 as a dependency.
 *
 * Stored format: base64(salt) + ":" + base64(derivedKey).
 */
export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const derived = (await scrypt(plain, salt, KEY_LENGTH)) as Buffer;
  return `${salt.toString("base64")}:${derived.toString("base64")}`;
}

/** Re-derives the key from `plain` using the stored salt and compares in
 *  constant time. Never decrypts anything - there is nothing to decrypt. */
export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  const [saltB64, hashB64] = stored.split(":");
  if (!saltB64 || !hashB64) return false;
  const salt = Buffer.from(saltB64, "base64");
  const expected = Buffer.from(hashB64, "base64");
  const derived = (await scrypt(plain, salt, expected.length)) as Buffer;
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}
