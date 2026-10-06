import { and, count, eq, sql } from "drizzle-orm";
import { escapeLike } from "../db/sql";
import { writeAudit, type Actor } from "../audit";
import { invalidate } from "../cache";
import type { Database } from "../db/client";
import { contentDocuments, enrollments, members } from "../db/schema";
import { contentTag, type TerminData } from "../content/schemas";

export class CapacityError extends Error {}

/** Enrolled active members per termin — the source of "slobodna mjesta". */
export async function enrollmentCounts(db: Database): Promise<Map<string, number>> {
  const rows = await db
    .select({ terminId: enrollments.terminId, n: count() })
    .from(enrollments)
    .innerJoin(members, eq(members.id, enrollments.memberId))
    .where(eq(members.active, true))
    .groupBy(enrollments.terminId);
  return new Map(rows.map((r) => [r.terminId, r.n]));
}

export async function listEnrolled(db: Database, terminId: string) {
  return db
    .select({
      enrollmentId: enrollments.id,
      memberId: members.id,
      firstName: members.firstName,
      lastName: members.lastName,
      phone: members.phone,
      active: members.active,
      createdAt: enrollments.createdAt,
    })
    .from(enrollments)
    .innerJoin(members, eq(members.id, enrollments.memberId))
    .where(eq(enrollments.terminId, terminId))
    .orderBy(members.lastName, members.firstName);
}

export async function enrollMember(db: Database, terminId: string, memberId: string, actor: Actor) {
  await db.transaction(async (tx) => {
    // Row lock on the termin serialises concurrent sign-ups for the last spot.
    const [termin] = await tx
      .select()
      .from(contentDocuments)
      .where(and(eq(contentDocuments.id, terminId), eq(contentDocuments.type, "termin")))
      .for("update");
    if (!termin) throw new Error("Termin nije pronađen.");
    const data = (termin.published ?? termin.draft) as TerminData;

    const [member] = await tx.select().from(members).where(eq(members.id, memberId));
    if (!member) throw new Error("Član nije pronađen.");
    if (!member.active) throw new Error("Član nije aktivan.");

    const [{ n }] = await tx
      .select({ n: count() })
      .from(enrollments)
      .innerJoin(members, eq(members.id, enrollments.memberId))
      .where(and(eq(enrollments.terminId, terminId), eq(members.active, true)));
    if (n >= data.maxParticipants) {
      throw new CapacityError(`Termin je popunjen (${n}/${data.maxParticipants}).`);
    }

    const inserted = await tx
      .insert(enrollments)
      .values({ terminId, memberId, createdBy: actor.id })
      .onConflictDoNothing()
      .returning();
    if (inserted.length === 0) throw new Error("Član je već upisan na ovaj termin.");

    await writeAudit(tx, actor, {
      action: "enroll",
      entityType: "termin",
      entityId: terminId,
      summary: `${member.firstName} ${member.lastName} upisan/a na termin ${data.dayOfWeek} ${data.startTime}`,
      details: { memberId },
    });
  });
  invalidate(contentTag("termin"));
}

export async function unenrollMember(db: Database, terminId: string, memberId: string, actor: Actor) {
  const [row] = await db
    .delete(enrollments)
    .where(and(eq(enrollments.terminId, terminId), eq(enrollments.memberId, memberId)))
    .returning();
  if (!row) return;
  const [member] = await db.select().from(members).where(eq(members.id, memberId));
  await writeAudit(db, actor, {
    action: "unenroll",
    entityType: "termin",
    entityId: terminId,
    summary: `${member ? `${member.firstName} ${member.lastName}` : "Član"} ispisan/a s termina`,
    details: { memberId },
  });
  invalidate(contentTag("termin"));
}

/** Members not yet on this termin, for the "upiši člana" picker. */
export async function searchMembersForTermin(db: Database, terminId: string, q: string) {
  const like = `%${escapeLike(q.trim())}%`;
  return db
    .select({ id: members.id, firstName: members.firstName, lastName: members.lastName, phone: members.phone })
    .from(members)
    .where(
      and(
        eq(members.active, true),
        sql`(${members.firstName} || ' ' || ${members.lastName}) ilike ${like}`,
        sql`not exists (select 1 from enrollments e where e.member_id = ${members.id} and e.termin_id = ${terminId})`,
      ),
    )
    .orderBy(members.lastName)
    .limit(10);
}
