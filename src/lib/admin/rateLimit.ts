/**
 * A simple in-memory sliding-window limiter for /admin/login attempts.
 * There was previously nothing at all throttling login attempts - this
 * raises the bar for a scripted/brute-force attempt against the single
 * shared ADMIN_TOKEN without needing to provision a shared store (Redis/
 * Upstash) this project doesn't otherwise have a reason to run.
 *
 * Known, accepted limitation: state lives in one serverless function
 * instance's memory, so it resets on cold start and isn't shared across
 * concurrent instances/regions - an attacker distributing requests across
 * many instances could exceed the nominal limit. That's a real gap for a
 * high-value target; for a single boutique shop's admin login it still
 * meaningfully slows the common case (one script, one IP, sustained
 * requests) from "unlimited" to "5 per 15 minutes per instance," which is
 * the actual goal here. A durable, cross-instance limiter would need a
 * shared store this app doesn't otherwise depend on.
 */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

type Bucket = { count: number; windowStart: number };
const buckets = new Map<string, Bucket>();

function currentBucket(key: string): Bucket | undefined {
  const bucket = buckets.get(key);
  if (!bucket) return undefined;
  if (Date.now() - bucket.windowStart > WINDOW_MS) {
    buckets.delete(key);
    return undefined;
  }
  return bucket;
}

export function isLoginRateLimited(key: string): boolean {
  const bucket = currentBucket(key);
  return Boolean(bucket && bucket.count >= MAX_ATTEMPTS);
}

export function recordFailedLogin(key: string): void {
  const bucket = currentBucket(key);
  if (!bucket) {
    buckets.set(key, { count: 1, windowStart: Date.now() });
    return;
  }
  bucket.count += 1;
}

/** Called on a successful login so a real password entered after a few
 *  typos doesn't stay throttled for the rest of the window. */
export function clearLoginAttempts(key: string): void {
  buckets.delete(key);
}
