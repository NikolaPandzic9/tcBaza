/**
 * In-memory token bucket, proportionate for a low-traffic single-tenant
 * site. Resets on deploy/cold-start — documented upgrade path is Upstash
 * Redis if abuse actually shows up (see HANDOVER.md).
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const attempts = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}
