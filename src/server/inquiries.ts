import { and, count, desc, eq, sql, type SQL } from "drizzle-orm";
import { escapeLike } from "./db/sql";
import { writeAudit, type Actor } from "./audit";
import type { Database } from "./db/client";
import { inquiries, inquiryStatus, type Inquiry } from "./db/schema";

export type InquiryStatus = Inquiry["status"];
export const INQUIRY_STATUSES = inquiryStatus.enumValues;
export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  novo: "Novo",
  u_obradi: "U obradi",
  rijeseno: "Riješeno",
  spam: "Spam",
};

export async function createInquiry(
  db: Database,
  input: { name: string; email: string; phone?: string | null; message: string; locale: string },
) {
  const [row] = await db
    .insert(inquiries)
    .values({ ...input, phone: input.phone || null })
    .returning();
  return row;
}

export async function markInquiryEmailed(db: Database, id: string) {
  await db.update(inquiries).set({ emailSent: true }).where(eq(inquiries.id, id));
}

export async function listInquiries(
  db: Database,
  options: { q?: string; status?: InquiryStatus; page?: number; pageSize?: number } = {},
) {
  const pageSize = Math.min(Math.max(options.pageSize ?? 20, 5), 100);
  const page = Math.max(options.page ?? 1, 1);
  const where: SQL[] = [];
  if (options.status) where.push(eq(inquiries.status, options.status));
  const q = options.q?.trim();
  if (q) {
    const like = `%${escapeLike(q)}%`;
    where.push(sql`(${inquiries.name} ilike ${like} or ${inquiries.email} ilike ${like} or ${inquiries.message} ilike ${like} or coalesce(${inquiries.phone}, '') ilike ${like})`);
  }
  const condition = where.length ? and(...where) : undefined;
  const [items, [{ total }]] = await Promise.all([
    db
      .select()
      .from(inquiries)
      .where(condition)
      .orderBy(desc(inquiries.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ total: count() }).from(inquiries).where(condition),
  ]);
  return { items, total, page, pageSize, pageCount: Math.max(Math.ceil(total / pageSize), 1) };
}

export async function getInquiry(db: Database, id: string) {
  const [row] = await db.select().from(inquiries).where(eq(inquiries.id, id));
  return row ?? null;
}

export async function updateInquiry(
  db: Database,
  id: string,
  input: { status: InquiryStatus; internalNote: string | null },
  actor: Actor,
) {
  const [row] = await db
    .update(inquiries)
    .set({ ...input, handledBy: actor.id, updatedAt: new Date() })
    .where(eq(inquiries.id, id))
    .returning();
  if (!row) throw new Error("Upit nije pronađen.");
  await writeAudit(db, actor, {
    action: "update",
    entityType: "inquiry",
    entityId: id,
    summary: `Upit od ${row.name} → ${INQUIRY_STATUS_LABELS[row.status]}`,
  });
  return row;
}

export async function deleteInquiry(db: Database, id: string, actor: Actor) {
  const [row] = await db.delete(inquiries).where(eq(inquiries.id, id)).returning();
  if (!row) throw new Error("Upit nije pronađen.");
  await writeAudit(db, actor, {
    action: "delete",
    entityType: "inquiry",
    entityId: id,
    summary: `Obrisan upit od ${row.name}`,
  });
}
