import { and, asc, count, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { writeAudit, type Actor } from "./audit";
import { hashPassword, validatePasswordStrength, verifyPassword } from "./auth/password";
import { ROLE_LABELS } from "./auth/permissions";
import { deleteUserSessions } from "./auth/sessions";
import type { Database } from "./db/client";
import { users, userRole, type User, type UserRole } from "./db/schema";

export class UserError extends Error {}

export const userSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Najmanje 3 znaka.")
    .max(40)
    .regex(/^[\p{L}\d._-]+$/u, "Samo slova, brojevi, tačka, crtica i donja crta."),
  displayName: z.string().trim().min(2, "Unesi ime.").max(80),
  email: z
    .union([z.literal(""), z.email("Neispravan email.")])
    .transform((v) => v || null),
  role: z.enum(userRole.enumValues),
  active: z.boolean(),
});

export async function listUsers(db: Database) {
  return db.select().from(users).orderBy(asc(users.displayName));
}

export async function getUser(db: Database, id: string) {
  const [row] = await db.select().from(users).where(eq(users.id, id));
  return row ?? null;
}

async function activeAdminCount(db: Database, excludeId?: string) {
  const [{ n }] = await db
    .select({ n: count() })
    .from(users)
    .where(and(eq(users.role, "admin"), eq(users.active, true), excludeId ? ne(users.id, excludeId) : undefined));
  return n;
}

export async function createUser(
  db: Database,
  input: z.infer<typeof userSchema> & { password: string },
  actor: Actor,
) {
  const weakness = validatePasswordStrength(input.password, input.username);
  if (weakness) throw new UserError(weakness);
  const usernameKey = input.username.toLowerCase();
  const [exists] = await db.select({ id: users.id }).from(users).where(eq(users.usernameKey, usernameKey));
  if (exists) throw new UserError("Korisničko ime je zauzeto.");

  const [row] = await db
    .insert(users)
    .values({
      username: input.username,
      usernameKey,
      displayName: input.displayName,
      email: input.email,
      role: input.role,
      active: input.active,
      passwordHash: await hashPassword(input.password),
    })
    .returning();
  await writeAudit(db, actor, {
    action: "user_create",
    entityType: "user",
    entityId: row.id,
    summary: `Novi korisnik „${row.username}“ (${ROLE_LABELS[row.role]})`,
  });
  return row;
}

export async function updateUser(db: Database, id: string, input: Omit<z.infer<typeof userSchema>, "username">, actor: Actor) {
  const user = await getUser(db, id);
  if (!user) throw new UserError("Korisnik nije pronađen.");
  const losesAdmin = user.role === "admin" && user.active && (input.role !== "admin" || !input.active);
  if (losesAdmin && (await activeAdminCount(db, id)) === 0) {
    throw new UserError("Mora postojati barem jedan aktivan administrator.");
  }
  if (id === actor.id && !input.active) throw new UserError("Ne možeš deaktivirati vlastiti nalog.");

  const [row] = await db
    .update(users)
    .set({ displayName: input.displayName, email: input.email, role: input.role, active: input.active, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  if (!input.active) await deleteUserSessions(db, id);
  await writeAudit(db, actor, {
    action: "user_update",
    entityType: "user",
    entityId: id,
    summary: `Izmijenjen korisnik „${row.username}“: ${ROLE_LABELS[row.role]}${row.active ? "" : ", deaktiviran"}`,
    details: { from: { role: user.role, active: user.active }, to: { role: row.role, active: row.active } },
  });
  return row;
}

/** Admin sets a new password (e.g. forgotten) — signs the user out everywhere. */
export async function resetPassword(db: Database, id: string, password: string, actor: Actor) {
  const user = await getUser(db, id);
  if (!user) throw new UserError("Korisnik nije pronađen.");
  const weakness = validatePasswordStrength(password, user.username);
  if (weakness) throw new UserError(weakness);
  await db
    .update(users)
    .set({ passwordHash: await hashPassword(password), passwordChangedAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, id));
  await deleteUserSessions(db, id);
  await writeAudit(db, actor, {
    action: "password_reset",
    entityType: "user",
    entityId: id,
    summary: `Administrator postavio novu lozinku za „${user.username}“`,
  });
}

export async function deleteUser(db: Database, id: string, actor: Actor) {
  if (id === actor.id) throw new UserError("Ne možeš obrisati vlastiti nalog.");
  const user = await getUser(db, id);
  if (!user) throw new UserError("Korisnik nije pronađen.");
  if (user.role === "admin" && user.active && (await activeAdminCount(db, id)) === 0) {
    throw new UserError("Mora postojati barem jedan aktivan administrator.");
  }
  await db.delete(users).where(eq(users.id, id));
  await writeAudit(db, actor, {
    action: "user_delete",
    entityType: "user",
    entityId: id,
    summary: `Obrisan korisnik „${user.username}“`,
  });
}

/* ------------------------------------------------------------------ */
/* Own account                                                         */
/* ------------------------------------------------------------------ */

export async function changeOwnPassword(
  db: Database,
  user: User,
  current: string,
  next: string,
  actor: Actor,
) {
  if (!(await verifyPassword(user.passwordHash, current))) throw new UserError("Trenutna lozinka nije ispravna.");
  if (current === next) throw new UserError("Nova lozinka mora biti drugačija od trenutne.");
  const weakness = validatePasswordStrength(next, user.username);
  if (weakness) throw new UserError(weakness);
  // passwordChangedAt invalidates every existing session (including this
  // one) — the caller issues a fresh session so this browser stays in.
  await db
    .update(users)
    .set({ passwordHash: await hashPassword(next), passwordChangedAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, user.id));
  await deleteUserSessions(db, user.id);
  await writeAudit(db, actor, { action: "password_change", entityType: "user", entityId: user.id, summary: "Promijenjena vlastita lozinka" });
}

export type { UserRole };
