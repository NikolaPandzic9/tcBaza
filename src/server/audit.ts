import { and, count, desc, eq, sql, type SQL } from "drizzle-orm";
import { auditLog } from "./db/schema";
import type { Database } from "./db/client";
import { escapeLike } from "./db/sql";

/** Who performed an action — a signed-in user, or the system (seed). */
export interface Actor {
  id: string | null;
  username: string | null;
  ip?: string | null;
}

export const SYSTEM_ACTOR: Actor = { id: null, username: "sistem", ip: null };

export interface AuditEntry {
  action: string;
  summary: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
}

type Executor = Pick<Database, "insert">;

export async function writeAudit(db: Executor, actor: Actor, entry: AuditEntry) {
  await db.insert(auditLog).values({
    userId: actor.id,
    username: actor.username,
    ip: actor.ip ?? null,
    action: entry.action,
    summary: entry.summary,
    entityType: entry.entityType ?? null,
    entityId: entry.entityId ?? null,
    details: entry.details ?? null,
  });
}

/* ------------------------------------------------------------------ */
/* Reading the log                                                     */
/* ------------------------------------------------------------------ */

export interface AuditQuery {
  q?: string;
  userId?: string;
  action?: string;
  entityType?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export async function listAudit(db: Database, query: AuditQuery = {}) {
  const pageSize = Math.min(Math.max(query.pageSize ?? 30, 10), 100);
  const page = Math.max(query.page ?? 1, 1);
  const where: SQL[] = [];
  if (query.userId) where.push(eq(auditLog.userId, query.userId));
  if (query.action) where.push(eq(auditLog.action, query.action));
  if (query.entityType) where.push(eq(auditLog.entityType, query.entityType));
  if (query.from) where.push(sql`${auditLog.createdAt} >= ${query.from}::date`);
  if (query.to) where.push(sql`${auditLog.createdAt} < (${query.to}::date + 1)`);
  if (query.q?.trim()) {
    const like = `%${escapeLike(query.q.trim())}%`;
    where.push(sql`(${auditLog.summary} ilike ${like} or coalesce(${auditLog.username}, '') ilike ${like} or coalesce(${auditLog.ip}, '') ilike ${like})`);
  }
  const condition = where.length ? and(...where) : undefined;
  const [items, [{ total }]] = await Promise.all([
    db.select().from(auditLog).where(condition).orderBy(desc(auditLog.createdAt)).limit(pageSize).offset((page - 1) * pageSize),
    db.select({ total: count() }).from(auditLog).where(condition),
  ]);
  return { items, total, page, pageSize, pageCount: Math.max(Math.ceil(total / pageSize), 1) };
}

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  login: "Prijava",
  login_failed: "Neuspješna prijava",
  login_blocked: "Blokirana prijava",
  logout: "Odjava",
  create: "Kreiranje",
  create_publish: "Kreiranje i objava",
  update: "Izmjena",
  publish: "Objava",
  unpublish: "Povlačenje s objave",
  discard: "Odbacivanje izmjena",
  restore_version: "Vraćanje verzije",
  delete: "Brisanje",
  restore: "Vraćanje iz otpada",
  purge: "Trajno brisanje",
  enroll: "Upis na termin",
  unenroll: "Ispis s termina",
  media_upload: "Otpremanje fajla",
  media_update: "Izmjena fajla",
  media_delete: "Brisanje fajla",
  user_create: "Novi korisnik",
  user_update: "Izmjena korisnika",
  user_delete: "Brisanje korisnika",
  password_change: "Promjena lozinke",
  password_reset: "Postavljanje lozinke",
  sessions_revoke: "Odjava ostalih uređaja",
  export: "Izvoz podataka",
  seed: "Početni uvoz",
};
