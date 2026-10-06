import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { MAX_FAILURES_PER_USER, checkLoginGate, recordLoginAttempt } from "@/server/auth/loginGuard";
import { hashPassword, validatePasswordStrength, verifyPassword } from "@/server/auth/password";
import { can } from "@/server/auth/permissions";
import { SESSION_IDLE_MS, createSession, validateSessionToken } from "@/server/auth/sessions";
import type { Database } from "@/server/db/client";
import { users } from "@/server/db/schema";
import { resetDatabase } from "./db";

let db: Database;

async function makeUser(overrides: Partial<typeof users.$inferInsert> = {}) {
  const [user] = await db
    .insert(users)
    .values({
      username: "Tester",
      usernameKey: "tester",
      displayName: "Tester",
      role: "urednik",
      passwordHash: await hashPassword("Sigurna-Lozinka-1"),
      ...overrides,
    })
    .returning();
  return user;
}

beforeEach(async () => {
  db = await resetDatabase();
});

describe("passwords", () => {
  it("hashes with argon2id and verifies only the right password", async () => {
    const hash = await hashPassword("Sigurna-Lozinka-1");
    expect(hash).toMatch(/^\$argon2id\$/);
    expect(await verifyPassword(hash, "Sigurna-Lozinka-1")).toBe(true);
    expect(await verifyPassword(hash, "sigurna-lozinka-1")).toBe(false);
    expect(await verifyPassword("not-a-hash", "x")).toBe(false);
  });

  it("enforces the strength policy", () => {
    expect(validatePasswordStrength("Kratka1!", "luka")).toMatch(/najmanje 10/);
    expect(validatePasswordStrength("samomalaslova", "luka")).toMatch(/tri od/);
    expect(validatePasswordStrength("Luka-Lozinka-123", "luka")).toMatch(/korisničko ime/);
    expect(validatePasswordStrength("Dobra-Lozinka-2026", "luka")).toBeNull();
  });
});

describe("brute-force protection", () => {
  it("locks an account after repeated failures, independent of IP", async () => {
    const now = new Date();
    for (let i = 0; i < MAX_FAILURES_PER_USER; i++) {
      await recordLoginAttempt(db, "luka", `10.0.0.${i}`, false);
    }
    const gate = await checkLoginGate(db, "luka", "10.0.0.99", now);
    expect(gate.allowed).toBe(false);
    expect(gate.retryAfterMinutes).toBeGreaterThan(0);
    // A different account is unaffected.
    expect((await checkLoginGate(db, "neko", "10.0.0.99", now)).allowed).toBe(true);
  });

  it("unlocks once the window has passed", async () => {
    for (let i = 0; i < MAX_FAILURES_PER_USER; i++) await recordLoginAttempt(db, "luka", "1.1.1.1", false);
    const later = new Date(Date.now() + 16 * 60 * 1000);
    expect((await checkLoginGate(db, "luka", "1.1.1.1", later)).allowed).toBe(true);
  });

  it("a successful login stops older failures from counting", async () => {
    for (let i = 0; i < MAX_FAILURES_PER_USER - 1; i++) await recordLoginAttempt(db, "luka", "1.1.1.1", false);
    await new Promise((r) => setTimeout(r, 5));
    await recordLoginAttempt(db, "luka", "1.1.1.1", true);
    await new Promise((r) => setTimeout(r, 5));
    await recordLoginAttempt(db, "luka", "1.1.1.1", false);
    expect((await checkLoginGate(db, "luka", "1.1.1.1")).allowed).toBe(true);
  });
});

describe("sessions", () => {
  const meta = { ip: "127.0.0.1", userAgent: "vitest" };

  it("stores only a hash of the token and validates it", async () => {
    const user = await makeUser();
    const { token } = await createSession(db, user.id, meta);
    const valid = await validateSessionToken(db, token);
    expect(valid?.user.id).toBe(user.id);
    expect(valid?.session.id).not.toBe(token);
    expect(await validateSessionToken(db, "forged-token")).toBeNull();
  });

  it("expires after the idle timeout", async () => {
    const user = await makeUser();
    const start = new Date();
    const { token } = await createSession(db, user.id, meta, start);
    const idle = new Date(start.getTime() + SESSION_IDLE_MS + 1000);
    expect(await validateSessionToken(db, token, idle)).toBeNull();
  });

  it("is invalidated by a password change or deactivation", async () => {
    const user = await makeUser();
    const { token } = await createSession(db, user.id, meta);
    await db.update(users).set({ passwordChangedAt: new Date(Date.now() + 5000) }).where(eq(users.id, user.id));
    expect(await validateSessionToken(db, token)).toBeNull();

    const other = await makeUser({ username: "Drugi", usernameKey: "drugi" });
    const s2 = await createSession(db, other.id, meta);
    await db.update(users).set({ active: false }).where(eq(users.id, other.id));
    expect(await validateSessionToken(db, s2.token)).toBeNull();
  });
});

describe("permissions", () => {
  it("matches the role model", () => {
    expect(can("admin", "users.manage")).toBe(true);
    expect(can("urednik", "users.manage")).toBe(false);
    expect(can("urednik", "content.publish")).toBe(true);
    expect(can("trener", "enrollments.manage")).toBe(true);
    expect(can("trener", "termini.edit")).toBe(false);
    expect(can("trener", "payments.manage")).toBe(false);
  });
});
