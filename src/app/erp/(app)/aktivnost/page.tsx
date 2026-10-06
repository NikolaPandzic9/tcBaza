import type { Metadata } from "next";
import { FilterSelect, SearchInput } from "@/components/erp/client";
import { Card, EmptyState, PageHeader, Pagination, Pill, formatDateTime, inputClass, param, table, type SearchParams } from "@/components/erp/ui";
import { AUDIT_ACTION_LABELS, listAudit } from "@/server/audit";
import { requireUser } from "@/server/auth/current";
import { getDb } from "@/server/db/client";
import { listUsers } from "@/server/users";

export const metadata: Metadata = { title: "Zapisnik aktivnosti" };

const ENTITY_LABELS: Record<string, string> = {
  termin: "Termin",
  program: "Program",
  teamMember: "Tim",
  partner: "Partner",
  recoveryService: "Oporavak",
  faqItem: "Česta pitanja",
  siteSettings: "Podešavanja",
  media: "Mediji",
  member: "Član",
  membership: "Članarina",
  payment: "Uplata",
  inquiry: "Upit",
  user: "Korisnik",
};

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const SECURITY = new Set(["login_failed", "login_blocked", "password_reset", "user_delete", "purge"]);

export default async function AuditPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireUser("audit.view");
  const params = await searchParams;
  const db = getDb();
  const from = param(params, "from");
  const to = param(params, "to");
  const [result, users] = await Promise.all([
    listAudit(db, {
      q: param(params, "q"),
      userId: param(params, "user"),
      action: param(params, "action"),
      entityType: param(params, "entity"),
      from: from && ISO.test(from) ? from : undefined,
      to: to && ISO.test(to) ? to : undefined,
      page: Number(param(params, "page") ?? 1) || 1,
    }),
    listUsers(db),
  ]);

  return (
    <>
      <PageHeader title="Zapisnik aktivnosti" description="Svaka prijava, izmjena, objava i brisanje — ko, šta, kada i odakle. Zapisi se ne mogu mijenjati iz ERP-a." />
      <Card padded={false}>
        <div className="flex flex-wrap items-center gap-3 border-b border-charcoal-100 px-4 py-3">
          <SearchInput placeholder="Opis, korisnik, IP…" />
          <FilterSelect param="user" label="Korisnik" options={users.map((u) => ({ value: u.id, label: u.displayName }))} />
          <FilterSelect param="action" label="Radnja" options={Object.entries(AUDIT_ACTION_LABELS).map(([value, label]) => ({ value, label }))} />
          <FilterSelect param="entity" label="Oblast" options={Object.entries(ENTITY_LABELS).map(([value, label]) => ({ value, label }))} />
          <form method="get" className="flex items-center gap-2">
            {Object.entries(params)
              .filter(([k, v]) => !["from", "to", "page"].includes(k) && typeof v === "string")
              .map(([k, v]) => (
                <input key={k} type="hidden" name={k} value={v as string} />
              ))}
            <input type="date" name="from" defaultValue={from} aria-label="Od datuma" className={`${inputClass} w-auto py-1.5`} />
            <span className="text-xs text-charcoal-500">–</span>
            <input type="date" name="to" defaultValue={to} aria-label="Do datuma" className={`${inputClass} w-auto py-1.5`} />
            <button type="submit" className="text-xs font-semibold uppercase text-navy-700 hover:underline">
              Primijeni
            </button>
          </form>
        </div>
        {result.items.length === 0 ? (
          <EmptyState title="Nema zapisa" />
        ) : (
          <div className={table.wrap}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th className={table.th}>Vrijeme</th>
                  <th className={table.th}>Korisnik</th>
                  <th className={table.th}>Radnja</th>
                  <th className={table.th}>Opis</th>
                  <th className={table.th}>IP</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((a) => (
                  <tr key={a.id} className={table.row}>
                    <td className={`${table.td} whitespace-nowrap text-xs text-charcoal-500`}>{formatDateTime(a.createdAt)}</td>
                    <td className={`${table.td} font-semibold text-navy-900`}>{a.username ?? "sistem"}</td>
                    <td className={table.td}>
                      <Pill tone={SECURITY.has(a.action) ? "red" : a.action.startsWith("login") || a.action === "logout" ? "gray" : "navy"}>
                        {AUDIT_ACTION_LABELS[a.action] ?? a.action}
                      </Pill>
                    </td>
                    <td className={table.td}>
                      {a.summary}
                      {a.entityType && <span className="ml-2 text-xs text-charcoal-500">({ENTITY_LABELS[a.entityType] ?? a.entityType})</span>}
                    </td>
                    <td className={`${table.td} text-xs text-charcoal-500`}>{a.ip ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination basePath="/aktivnost" params={params} page={result.page} pageCount={result.pageCount} total={result.total} />
      </Card>
    </>
  );
}
