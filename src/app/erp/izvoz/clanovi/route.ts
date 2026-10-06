import type { NextRequest } from "next/server";
import { writeAudit } from "@/server/audit";
import { getCurrentSession, getRequestMeta } from "@/server/auth/current";
import { can } from "@/server/auth/permissions";
import { csvResponse, toCsv } from "@/server/csv";
import { getDb } from "@/server/db/client";
import { listMembers, type MembershipState } from "@/server/members/members";

/** Members export (respects the list's current filters). */
export async function GET(request: NextRequest) {
  const current = await getCurrentSession();
  if (!current || !can(current.user.role, "members.edit")) {
    return new Response("Zabranjeno", { status: 403 });
  }
  const sp = request.nextUrl.searchParams;
  const db = getDb();
  const rows: unknown[][] = [];
  for (let page = 1; ; page++) {
    const result = await listMembers(db, {
      q: sp.get("q") ?? undefined,
      active: (sp.get("active") as "da" | "ne") ?? undefined,
      state: (sp.get("state") as MembershipState) ?? undefined,
      program: sp.get("program") ?? undefined,
      page,
      pageSize: 100,
    });
    for (const m of result.items) {
      rows.push([
        m.firstName,
        m.lastName,
        m.phone,
        m.email,
        m.birthDate,
        m.guardianName,
        m.guardianPhone,
        m.active ? "da" : "ne",
        m.latest?.label,
        m.latest?.startDate,
        m.latest?.endDate,
        m.note,
      ]);
    }
    if (page >= result.pageCount) break;
  }

  const meta = await getRequestMeta();
  await writeAudit(db, { id: current.user.id, username: current.user.displayName, ip: meta.ip }, {
    action: "export",
    entityType: "member",
    summary: `Izvoz članova (${rows.length} zapisa)`,
  });

  return csvResponse(
    `clanovi-${new Date().toISOString().slice(0, 10)}.csv`,
    toCsv(
      ["Ime", "Prezime", "Telefon", "Email", "Datum rođenja", "Roditelj", "Telefon roditelja", "Aktivan", "Članarina", "Od", "Do", "Napomena"],
      rows,
    ),
  );
}
