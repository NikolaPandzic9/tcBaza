import { and, count, desc, eq, gte, isNull, lte, sql } from "drizzle-orm";
import type { Database } from "./db/client";
import { auditLog, contentDocuments, inquiries, members, memberships, payments } from "./db/schema";
import { listPublished } from "./content/documents";
import { DAYS } from "./content/schemas";
import { enrollmentCounts } from "./members/enrollments";
import { EXPIRING_DAYS, addDaysIso, todayIso } from "./members/members";

function monthStart(iso: string, offset = 0): string {
  const [y, m] = iso.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + offset, 1));
  return d.toISOString().slice(0, 10);
}

export async function getDashboard(db: Database, now = new Date()) {
  const today = todayIso(now);
  const soon = addDaysIso(today, EXPIRING_DAYS);
  const thisMonth = monthStart(today);
  const sixMonthsAgo = monthStart(today, -5);
  // JS getDay: 0 = Sunday; DAYS starts on Monday.
  const weekday = new Date(`${today}T12:00:00Z`).getUTCDay();
  const todayName = DAYS[(weekday + 6) % 7];

  const latestEnd = sql`(select max(end_date) from memberships ms where ms.member_id = ${members.id})`;

  const [
    [{ activeMembers }],
    [{ expiredMembers }],
    expiring,
    revenueByMonth,
    [{ newInquiries }],
    latestInquiries,
    [{ unpublished }],
    recentActivity,
    termini,
    programs,
    team,
    counts,
  ] = await Promise.all([
    db.select({ activeMembers: count() }).from(members).where(eq(members.active, true)),
    db
      .select({ expiredMembers: count() })
      .from(members)
      .where(and(eq(members.active, true), sql`${latestEnd} < ${today}`)),
    db
      .select({
        memberId: members.id,
        firstName: members.firstName,
        lastName: members.lastName,
        label: memberships.label,
        endDate: memberships.endDate,
      })
      .from(memberships)
      .innerJoin(members, eq(members.id, memberships.memberId))
      .where(
        and(
          eq(members.active, true),
          gte(memberships.endDate, today),
          lte(memberships.endDate, soon),
          // Only if it's the member's latest membership (not already renewed).
          sql`${memberships.endDate} = ${latestEnd}`,
        ),
      )
      .orderBy(memberships.endDate)
      .limit(8),
    db
      .select({
        month: sql<string>`to_char(date_trunc('month', ${payments.paidAt}), 'YYYY-MM')`,
        total: sql<string>`sum(${payments.amount})`,
      })
      .from(payments)
      .where(gte(payments.paidAt, sixMonthsAgo))
      .groupBy(sql`1`)
      .orderBy(sql`1`),
    db.select({ newInquiries: count() }).from(inquiries).where(eq(inquiries.status, "novo")),
    db.select().from(inquiries).orderBy(desc(inquiries.createdAt)).limit(5),
    db
      .select({ unpublished: count() })
      .from(contentDocuments)
      .where(
        and(
          isNull(contentDocuments.deletedAt),
          sql`(${contentDocuments.published} is null or ${contentDocuments.version} <> ${contentDocuments.publishedVersion})`,
        ),
      ),
    db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(8),
    listPublished(db, "termin"),
    listPublished(db, "program"),
    listPublished(db, "teamMember"),
    enrollmentCounts(db),
  ]);

  const programNames = new Map(programs.map((p) => [p.key, p.data.name.bs]));
  const trainerNames = new Map(team.map((t) => [t.id, t.data.name]));
  const todaysTermini = termini
    .filter((t) => t.data.active && t.data.dayOfWeek === todayName)
    .sort((a, b) => a.data.startTime.localeCompare(b.data.startTime))
    .map((t) => ({
      id: t.id,
      time: `${t.data.startTime}–${t.data.endTime}`,
      program: `${programNames.get(t.data.programKey) ?? t.data.programKey}${t.data.group.bs ? ` ${t.data.group.bs}` : ""}`,
      trainer: t.data.trainerId ? (trainerNames.get(t.data.trainerId) ?? null) : null,
      taken: counts.get(t.id) ?? 0,
      max: t.data.maxParticipants,
      status: t.data.status,
    }));

  const months = Array.from({ length: 6 }, (_, i) => monthStart(today, i - 5).slice(0, 7));
  const revenue = months.map((month) => ({
    month,
    total: Number(revenueByMonth.find((r) => r.month === month)?.total ?? 0),
  }));

  return {
    today,
    todayName,
    activeMembers,
    expiredMembers,
    expiring,
    revenue,
    revenueThisMonth: revenue.find((r) => r.month === thisMonth.slice(0, 7))?.total ?? 0,
    newInquiries,
    latestInquiries,
    unpublished,
    recentActivity,
    todaysTermini,
  };
}
