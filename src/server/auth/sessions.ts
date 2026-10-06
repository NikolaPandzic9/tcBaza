import { and, eq, ne } from "drizzle-orm";
import type { Database } from "../db/client";
import { sessions, users, type User } from "../db/schema";
import { randomToken, sha256 } from "./crypto";

/** Hard cap from sign-in, regardless of activity. */
export const SESSION_ABSOLUTE_MS = 12 * 60 * 60 * 1000;
/** Signed out after this long without a request. */
export const SESSION_IDLE_MS = 2 * 60 * 60 * 1000;

export interface SessionMeta {
  ip: string | null;
  userAgent: string | null;
}

export async function createSession(
  db: Database,
  userId: string,
  meta: SessionMeta,
  now = new Date(),
) {
  const token = randomToken();
  const expiresAt = new Date(now.getTime() + SESSION_ABSOLUTE_MS);
  await db.insert(sessions).values({
    id: sha256(token),
    userId,
    createdAt: now,
    lastSeenAt: now,
    expiresAt,
    ip: meta.ip,
    userAgent: meta.userAgent?.slice(0, 300) ?? null,
  });
  return { token, expiresAt };
}

export type ValidSession = { session: typeof sessions.$inferSelect; user: User };

export async function validateSessionToken(db: Database, token: string, now = new Date()): Promise<ValidSession | null> {
  const id = sha256(token);
  const [row] = await db
    .select({ session: sessions, user: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(eq(sessions.id, id));
  if (!row) return null;

  const { session, user } = row;
  const idleExpired = now.getTime() - session.lastSeenAt.getTime() > SESSION_IDLE_MS;
  // A password change after the session started invalidates it.
  const staleCredentials = user.passwordChangedAt.getTime() > session.createdAt.getTime() + 1000;
  if (session.expiresAt <= now || idleExpired || !user.active || staleCredentials) {
    await db.delete(sessions).where(eq(sessions.id, id));
    return null;
  }

  // Sliding idle window — written at most once a minute to spare the DB.
  if (now.getTime() - session.lastSeenAt.getTime() > 60_000) {
    await db.update(sessions).set({ lastSeenAt: now }).where(eq(sessions.id, id));
    session.lastSeenAt = now;
  }
  return { session, user };
}

export async function deleteSession(db: Database, token: string) {
  await db.delete(sessions).where(eq(sessions.id, sha256(token)));
}

export async function deleteSessionById(db: Database, userId: string, sessionId: string) {
  await db.delete(sessions).where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)));
}

export async function deleteUserSessions(db: Database, userId: string, exceptSessionId?: string) {
  await db
    .delete(sessions)
    .where(exceptSessionId ? and(eq(sessions.userId, userId), ne(sessions.id, exceptSessionId)) : eq(sessions.userId, userId));
}

export async function listUserSessions(db: Database, userId: string) {
  return db
    .select()
    .from(sessions)
    .where(eq(sessions.userId, userId))
    .orderBy(sessions.lastSeenAt);
}
