import { and, asc, count, desc, eq, sql, type SQL } from "drizzle-orm";
import { escapeLike } from "../db/sql";
import { z } from "zod";
import { writeAudit, type Actor } from "../audit";
import { invalidate } from "../cache";
import type { Database } from "../db/client";
import { contentDocuments, enrollments, members, memberships, payments } from "../db/schema";
import { contentTag } from "../content/schemas";

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => v || null)
    .nullable()
    .default(null);

export const memberSchema = z.object({
  firstName: z.string().trim().min(1, "Unesi ime.").max(60),
  lastName: z.string().trim().min(1, "Unesi prezime.").max(60),
  phone: optionalText(40),
  email: z
    .union([z.literal(""), z.email("Neispravan email.")])
    .transform((v) => v || null)
    .nullable()
    .default(null),
  birthDate: z
    .union([z.literal(""), z.iso.date("Neispravan datum.")])
    .transform((v) => v || null)
    .nullable()
    .default(null),
  guardianName: optionalText(100),
  guardianPhone: optionalText(40),
  note: optionalText(1000),
  active: z.boolean().default(true),
});
export type MemberInput = z.infer<typeof memberSchema>;

export const membershipSchema = z
  .object({
    programKey: z.string().trim().min(1, "Izaberi program."),
    label: z.string().trim().min(1, "Unesi naziv članarine.").max(120),
    price: z.number().min(0, "Cijena ne može biti negativna.").max(100000),
    startDate: z.iso.date("Neispravan datum početka."),
    endDate: z.iso.date("Neispravan datum isteka."),
    note: optionalText(500),
  })
  .refine((v) => v.endDate >= v.startDate, {
    path: ["endDate"],
    message: "Datum isteka mora biti poslije datuma početka.",
  });
export type MembershipInput = z.infer<typeof membershipSchema>;

export const PAYMENT_METHODS = ["gotovina", "kartica", "uplata"] as const;
export const PAYMENT_METHOD_LABELS: Record<(typeof PAYMENT_METHODS)[number], string> = {
  gotovina: "Gotovina",
  kartica: "Kartica",
  uplata: "Uplata na račun",
};

export const paymentSchema = z.object({
  amount: z.number().positive("Iznos mora biti veći od 0.").max(100000),
  paidAt: z.iso.date("Neispravan datum."),
  method: z.enum(PAYMENT_METHODS),
  membershipId: z
    .union([z.literal(""), z.uuid()])
    .transform((v) => v || null)
    .nullable()
    .default(null),
  note: optionalText(500),
});
export type PaymentInput = z.infer<typeof paymentSchema>;

/* ------------------------------------------------------------------ */
/* Membership status                                                   */
/* ------------------------------------------------------------------ */

export type MembershipState = "aktivna" | "istice" | "istekla" | "buduca" | "bez";
export const EXPIRING_DAYS = 7;

export function todayIso(now = new Date()): string {
  // Business runs on Sarajevo time — "today" must not flip at UTC midnight.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Sarajevo" }).format(now);
}

export function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function membershipState(m: { startDate: string; endDate: string } | null, today = todayIso()): MembershipState {
  if (!m) return "bez";
  if (m.startDate > today) return "buduca";
  if (m.endDate < today) return "istekla";
  if (m.endDate <= addDaysIso(today, EXPIRING_DAYS)) return "istice";
  return "aktivna";
}

/* ------------------------------------------------------------------ */
/* Members                                                             */
/* ------------------------------------------------------------------ */

export interface MemberListOptions {
  q?: string;
  active?: "da" | "ne";
  state?: MembershipState;
  program?: string;
  sort?: "name" | "newest" | "expiry";
  dir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

/** Latest (furthest-ending) membership per member. */
const latest = sql`(
  select row_to_json(x) from (
    select ms.id, ms.program_key as "programKey", ms.label, ms.start_date as "startDate", ms.end_date as "endDate"
    from memberships ms where ms.member_id = ${members.id}
    order by ms.end_date desc limit 1
  ) x
)`;

export async function listMembers(db: Database, options: MemberListOptions = {}, today = todayIso()) {
  const pageSize = Math.min(Math.max(options.pageSize ?? 20, 5), 100);
  const page = Math.max(options.page ?? 1, 1);
  const where: SQL[] = [];

  const q = options.q?.trim();
  if (q) {
    const like = `%${escapeLike(q)}%`;
    where.push(
      sql`(${members.firstName} || ' ' || ${members.lastName} ilike ${like} or ${members.lastName} || ' ' || ${members.firstName} ilike ${like} or coalesce(${members.phone}, '') ilike ${like} or coalesce(${members.email}, '') ilike ${like} or coalesce(${members.guardianName}, '') ilike ${like})`,
    );
  }
  if (options.active) where.push(eq(members.active, options.active === "da"));
  if (options.program) {
    where.push(sql`exists (select 1 from memberships ms where ms.member_id = ${members.id} and ms.program_key = ${options.program})`);
  }

  const lastEnd = sql`(select max(end_date) from memberships ms where ms.member_id = ${members.id})`;
  const lastStart = sql`(select start_date from memberships ms where ms.member_id = ${members.id} order by end_date desc limit 1)`;
  const soon = addDaysIso(today, EXPIRING_DAYS);
  switch (options.state) {
    case "bez":
      where.push(sql`${lastEnd} is null`);
      break;
    case "istekla":
      where.push(sql`${lastEnd} < ${today}`);
      break;
    case "istice":
      where.push(sql`${lastEnd} >= ${today} and ${lastEnd} <= ${soon} and ${lastStart} <= ${today}`);
      break;
    case "aktivna":
      where.push(sql`${lastEnd} > ${soon} and ${lastStart} <= ${today}`);
      break;
    case "buduca":
      where.push(sql`${lastStart} > ${today}`);
      break;
  }

  const dir = options.dir === "desc" ? desc : asc;
  const order =
    options.sort === "newest"
      ? [desc(members.createdAt)]
      : options.sort === "expiry"
        ? [dir(sql`${lastEnd} nulls last`)]
        : [dir(members.lastName), dir(members.firstName)];

  const condition = where.length ? and(...where) : undefined;
  const [rows, [{ total }]] = await Promise.all([
    db
      .select({ member: members, latest: latest.mapWith((v) => v as LatestMembership | null) })
      .from(members)
      .where(condition)
      .orderBy(...order)
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ total: count() }).from(members).where(condition),
  ]);

  return {
    items: rows.map((r) => ({ ...r.member, latest: r.latest, state: membershipState(r.latest, today) })),
    total,
    page,
    pageSize,
    pageCount: Math.max(Math.ceil(total / pageSize), 1),
  };
}

interface LatestMembership {
  id: string;
  programKey: string;
  label: string;
  startDate: string;
  endDate: string;
}

export async function getMember(db: Database, id: string) {
  const [member] = await db.select().from(members).where(eq(members.id, id));
  if (!member) return null;
  const [membershipRows, paymentRows, enrollmentRows] = await Promise.all([
    db.select().from(memberships).where(eq(memberships.memberId, id)).orderBy(desc(memberships.endDate)),
    db.select().from(payments).where(eq(payments.memberId, id)).orderBy(desc(payments.paidAt), desc(payments.createdAt)),
    db
      .select({ id: enrollments.id, terminId: enrollments.terminId, termin: contentDocuments.draft })
      .from(enrollments)
      .innerJoin(contentDocuments, eq(contentDocuments.id, enrollments.terminId))
      .where(eq(enrollments.memberId, id)),
  ]);
  return { member, memberships: membershipRows, payments: paymentRows, enrollments: enrollmentRows };
}

const fullName = (m: { firstName: string; lastName: string }) => `${m.firstName} ${m.lastName}`;

export async function createMember(db: Database, input: MemberInput, actor: Actor) {
  const data = memberSchema.parse(input);
  const [row] = await db.insert(members).values({ ...data, createdBy: actor.id }).returning();
  await writeAudit(db, actor, {
    action: "create",
    entityType: "member",
    entityId: row.id,
    summary: `Novi član: ${fullName(row)}`,
  });
  return row;
}

export async function updateMember(db: Database, id: string, input: MemberInput, actor: Actor) {
  const data = memberSchema.parse(input);
  const [row] = await db
    .update(members)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(members.id, id))
    .returning();
  if (!row) throw new Error("Član nije pronađen.");
  await writeAudit(db, actor, {
    action: "update",
    entityType: "member",
    entityId: id,
    summary: `Izmijenjen član: ${fullName(row)}`,
  });
  // Inactive members stop counting toward termin capacity.
  invalidate(contentTag("termin"));
  return row;
}

/** Hard delete — removes all personal data, memberships and payments. */
export async function deleteMember(db: Database, id: string, actor: Actor) {
  const [row] = await db.delete(members).where(eq(members.id, id)).returning();
  if (!row) throw new Error("Član nije pronađen.");
  await writeAudit(db, actor, {
    action: "delete",
    entityType: "member",
    entityId: id,
    summary: `Obrisan član: ${fullName(row)} (sa svim članarinama i uplatama)`,
  });
  invalidate(contentTag("termin"));
}

export async function addMembership(db: Database, memberId: string, input: MembershipInput, actor: Actor) {
  const data = membershipSchema.parse(input);
  const [row] = await db.insert(memberships).values({ ...data, memberId, createdBy: actor.id }).returning();
  await writeAudit(db, actor, {
    action: "create",
    entityType: "membership",
    entityId: row.id,
    summary: `Nova članarina „${row.label}“ (${row.startDate} – ${row.endDate})`,
    details: { memberId },
  });
  return row;
}

export async function deleteMembership(db: Database, memberId: string, membershipId: string, actor: Actor) {
  const [row] = await db
    .delete(memberships)
    .where(and(eq(memberships.id, membershipId), eq(memberships.memberId, memberId)))
    .returning();
  if (!row) throw new Error("Članarina nije pronađena.");
  await writeAudit(db, actor, {
    action: "delete",
    entityType: "membership",
    entityId: membershipId,
    summary: `Obrisana članarina „${row.label}“`,
    details: { memberId },
  });
}

export async function addPayment(db: Database, memberId: string, input: PaymentInput, actor: Actor) {
  const data = paymentSchema.parse(input);
  const [row] = await db.insert(payments).values({ ...data, memberId, createdBy: actor.id }).returning();
  await writeAudit(db, actor, {
    action: "create",
    entityType: "payment",
    entityId: row.id,
    summary: `Uplata ${row.amount.toFixed(2)} KM (${PAYMENT_METHOD_LABELS[data.method]})`,
    details: { memberId },
  });
  return row;
}

export async function deletePayment(db: Database, memberId: string, paymentId: string, actor: Actor) {
  const [row] = await db
    .delete(payments)
    .where(and(eq(payments.id, paymentId), eq(payments.memberId, memberId)))
    .returning();
  if (!row) throw new Error("Uplata nije pronađena.");
  await writeAudit(db, actor, {
    action: "delete",
    entityType: "payment",
    entityId: paymentId,
    summary: `Obrisana uplata ${row.amount.toFixed(2)} KM od ${row.paidAt}`,
    details: { memberId },
  });
}

/** Payments list across all members (for the finance view). */
export async function listPayments(
  db: Database,
  options: { from?: string; to?: string; method?: string; page?: number; pageSize?: number } = {},
) {
  const pageSize = Math.min(Math.max(options.pageSize ?? 25, 5), 100);
  const page = Math.max(options.page ?? 1, 1);
  const where: SQL[] = [];
  if (options.from) where.push(sql`${payments.paidAt} >= ${options.from}`);
  if (options.to) where.push(sql`${payments.paidAt} <= ${options.to}`);
  if (options.method) where.push(eq(payments.method, options.method));
  const condition = where.length ? and(...where) : undefined;

  const [items, [summary]] = await Promise.all([
    db
      .select({ payment: payments, firstName: members.firstName, lastName: members.lastName })
      .from(payments)
      .innerJoin(members, eq(members.id, payments.memberId))
      .where(condition)
      .orderBy(desc(payments.paidAt), desc(payments.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ total: count(), sum: sql<string>`coalesce(sum(${payments.amount}), 0)` })
      .from(payments)
      .where(condition),
  ]);
  return {
    items,
    total: summary.total,
    sum: Number(summary.sum),
    page,
    pageSize,
    pageCount: Math.max(Math.ceil(summary.total / pageSize), 1),
  };
}
