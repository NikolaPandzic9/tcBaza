import { and, count, desc, eq, gte, lt, min } from "drizzle-orm";
import type { Database } from "../db/client";
import { loginAttempts } from "../db/schema";

/**
 * Brute-force protection, stored in the database so it holds across every
 * serverless instance (an in-memory counter would reset per instance):
 *  - 5 failed attempts for one username in 15 min → that account locks for
 *    the rest of the window;
 *  - 30 failed attempts from one IP in 15 min → that IP is blocked.
 * A successful login doesn't erase history — it only stops counting
 * failures that happened before it for that username.
 */
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;
export const MAX_FAILURES_PER_USER = 5;
export const MAX_FAILURES_PER_IP = 30;

export interface LoginGate {
  allowed: boolean;
  retryAfterMinutes?: number;
}

export async function checkLoginGate(db: Database, usernameKey: string, ip: string, now = new Date()): Promise<LoginGate> {
  const since = new Date(now.getTime() - LOGIN_WINDOW_MS);

  const [lastSuccess] = await db
    .select({ at: loginAttempts.createdAt })
    .from(loginAttempts)
    .where(and(eq(loginAttempts.usernameKey, usernameKey), eq(loginAttempts.success, true), gte(loginAttempts.createdAt, since)))
    .orderBy(desc(loginAttempts.createdAt))
    .limit(1);
  const userSince = lastSuccess && lastSuccess.at > since ? lastSuccess.at : since;

  const [[userFailures], [ipFailures]] = await Promise.all([
    db
      .select({ n: count(), first: min(loginAttempts.createdAt) })
      .from(loginAttempts)
      .where(and(eq(loginAttempts.usernameKey, usernameKey), eq(loginAttempts.success, false), gte(loginAttempts.createdAt, userSince))),
    db
      .select({ n: count(), first: min(loginAttempts.createdAt) })
      .from(loginAttempts)
      .where(and(eq(loginAttempts.ip, ip), eq(loginAttempts.success, false), gte(loginAttempts.createdAt, since))),
  ]);

  const blocked =
    userFailures.n >= MAX_FAILURES_PER_USER
      ? userFailures.first
      : ipFailures.n >= MAX_FAILURES_PER_IP
        ? ipFailures.first
        : null;

  if (!blocked) return { allowed: true };
  const unlockAt = new Date(blocked).getTime() + LOGIN_WINDOW_MS;
  return { allowed: false, retryAfterMinutes: Math.max(1, Math.ceil((unlockAt - now.getTime()) / 60000)) };
}

export async function recordLoginAttempt(db: Database, usernameKey: string, ip: string, success: boolean) {
  await db.insert(loginAttempts).values({ usernameKey, ip, success });
}

/** Keeps the table small; called opportunistically on login. */
export async function pruneLoginAttempts(db: Database, now = new Date()) {
  await db.delete(loginAttempts).where(lt(loginAttempts.createdAt, new Date(now.getTime() - 30 * 24 * 3600 * 1000)));
}
