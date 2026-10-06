import type { NextRequest } from "next/server";
import { writeAudit } from "@/server/audit";
import { getCurrentSession, getRequestMeta } from "@/server/auth/current";
import { can } from "@/server/auth/permissions";
import { csvResponse, toCsv } from "@/server/csv";
import { getDb } from "@/server/db/client";
import { PAYMENT_METHOD_LABELS, listPayments } from "@/server/members/members";

export async function GET(request: NextRequest) {
  const current = await getCurrentSession();
  if (!current || !can(current.user.role, "payments.manage")) {
    return new Response("Zabranjeno", { status: 403 });
  }
  const sp = request.nextUrl.searchParams;
  const db = getDb();
  const rows: unknown[][] = [];
  for (let page = 1; ; page++) {
    const result = await listPayments(db, {
      from: sp.get("from") ?? undefined,
      to: sp.get("to") ?? undefined,
      method: sp.get("method") ?? undefined,
      page,
      pageSize: 100,
    });
    for (const { payment, firstName, lastName } of result.items) {
      rows.push([
        payment.paidAt,
        `${firstName} ${lastName}`,
        payment.amount.toFixed(2).replace(".", ","),
        PAYMENT_METHOD_LABELS[payment.method as keyof typeof PAYMENT_METHOD_LABELS] ?? payment.method,
        payment.note,
      ]);
    }
    if (page >= result.pageCount) break;
  }

  const meta = await getRequestMeta();
  await writeAudit(db, { id: current.user.id, username: current.user.displayName, ip: meta.ip }, {
    action: "export",
    entityType: "payment",
    summary: `Izvoz uplata (${rows.length} zapisa)`,
  });

  return csvResponse(`uplate-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(["Datum", "Član", "Iznos (KM)", "Način", "Napomena"], rows));
}
