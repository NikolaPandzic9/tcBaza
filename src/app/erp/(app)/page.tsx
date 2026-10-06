import type { Metadata } from "next";
import Link from "next/link";
import { Card, EmptyState, PageHeader, Pill, StatTile, formatDate, formatDateTime, formatKM } from "@/components/erp/ui";
import { requireUser } from "@/server/auth/current";
import { can } from "@/server/auth/permissions";
import { getDashboard } from "@/server/dashboard";
import { getDb } from "@/server/db/client";
import { INQUIRY_STATUS_LABELS } from "@/server/inquiries";

export const metadata: Metadata = { title: "Pregled" };

const MONTHS = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "avg", "sep", "okt", "nov", "dec"];

export default async function DashboardPage() {
  const { user } = await requireUser("dashboard.view");
  const d = await getDashboard(getDb());
  const showFinance = can(user.role, "payments.manage");
  const showInquiries = can(user.role, "inquiries.manage");
  const maxRevenue = Math.max(...d.revenue.map((r) => r.total), 1);

  return (
    <>
      <PageHeader
        title={`Zdravo, ${user.displayName}`}
        description={`${d.todayName}, ${formatDate(d.today)} — pregled stanja u Bazi.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Aktivni članovi" value={d.activeMembers} href="/clanovi?active=da" />
        <StatTile
          label="Članarine ističu (7 dana)"
          value={d.expiring.length}
          hint={d.expiredMembers > 0 ? `${d.expiredMembers} aktivnih članova s isteklom članarinom` : "Nema isteklih članarina"}
          href="/clanovi?state=istice"
          tone="amber"
        />
        {showFinance ? (
          <StatTile label="Prihod ovog mjeseca" value={formatKM(d.revenueThisMonth)} href="/uplate" tone="lime" />
        ) : (
          <StatTile label="Termini danas" value={d.todaysTermini.length} href="/termini" tone="lime" />
        )}
        {showInquiries ? (
          <StatTile label="Novi upiti" value={d.newInquiries} href="/upiti?status=novo" tone={d.newInquiries > 0 ? "red" : "navy"} />
        ) : (
          <StatTile label="Neobjavljene izmjene" value={d.unpublished} tone="navy" />
        )}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card title={`Termini danas · ${d.todayName}`} className="xl:col-span-2" padded={false}>
          {d.todaysTermini.length === 0 ? (
            <EmptyState title="Danas nema termina" />
          ) : (
            <ul className="divide-y divide-charcoal-100">
              {d.todaysTermini.map((t) => (
                <li key={t.id}>
                  <Link href={`/termini/${t.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-sm hover:bg-navy-50">
                    <span className="w-24 font-display text-base text-navy-900">{t.time}</span>
                    <span className="min-w-0 flex-1">
                      <span className="font-semibold text-navy-900">{t.program}</span>
                      {t.trainer && <span className="ml-2 text-xs text-charcoal-500">{t.trainer}</span>}
                    </span>
                    <span className="flex w-full items-center gap-2 sm:w-40">
                      <span className="h-2 flex-1 bg-charcoal-100" aria-hidden>
                        <span
                          className={`block h-full ${t.taken >= t.max ? "bg-status-full-text" : "bg-accent-500"}`}
                          style={{ width: `${Math.min(100, (t.taken / t.max) * 100)}%` }}
                        />
                      </span>
                      <span className="text-xs font-semibold text-navy-900">
                        {t.taken}/{t.max}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Članarine pred istekom" padded={false}>
          {d.expiring.length === 0 ? (
            <EmptyState title="Ništa ne ističe">u narednih 7 dana</EmptyState>
          ) : (
            <ul className="divide-y divide-charcoal-100">
              {d.expiring.map((m) => (
                <li key={`${m.memberId}-${m.endDate}`}>
                  <Link href={`/clanovi/${m.memberId}`} className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-navy-50">
                    <span>
                      <span className="block font-semibold text-navy-900">
                        {m.firstName} {m.lastName}
                      </span>
                      <span className="text-xs text-charcoal-500">{m.label}</span>
                    </span>
                    <Pill tone="amber">{formatDate(m.endDate)}</Pill>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {showFinance && (
          <Card title="Prihod — zadnjih 6 mjeseci" className="xl:col-span-2">
            <div className="flex h-44 items-end gap-3" role="img" aria-label={d.revenue.map((r) => `${r.month}: ${formatKM(r.total)}`).join(", ")}>
              {d.revenue.map((r) => {
                const month = Number(r.month.slice(5, 7)) - 1;
                return (
                  <div key={r.month} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                    <span className="text-[0.65rem] font-semibold text-navy-900">{r.total > 0 ? Math.round(r.total) : ""}</span>
                    <span
                      className="clip-corner w-full max-w-14 bg-navy-700"
                      style={{ height: `${Math.max((r.total / maxRevenue) * 100, r.total > 0 ? 4 : 1)}%` }}
                    />
                    <span className="text-xs uppercase text-charcoal-500">{MONTHS[month]}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {showInquiries && (
          <Card title="Zadnji upiti" padded={false} actions={<Link href="/upiti" className="text-xs font-semibold uppercase text-navy-700 hover:underline">Svi</Link>}>
            {d.latestInquiries.length === 0 ? (
              <EmptyState title="Nema upita" />
            ) : (
              <ul className="divide-y divide-charcoal-100">
                {d.latestInquiries.map((q) => (
                  <li key={q.id}>
                    <Link href={`/upiti/${q.id}`} className="block px-5 py-3 text-sm hover:bg-navy-50">
                      <span className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-navy-900">{q.name}</span>
                        <Pill tone={q.status === "novo" ? "red" : q.status === "rijeseno" ? "green" : "gray"}>{INQUIRY_STATUS_LABELS[q.status]}</Pill>
                      </span>
                      <span className="mt-0.5 line-clamp-1 text-xs text-charcoal-500">{q.message}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        {can(user.role, "audit.view") && (
          <Card title="Zadnje aktivnosti" className="xl:col-span-3" padded={false} actions={<Link href="/aktivnost" className="text-xs font-semibold uppercase text-navy-700 hover:underline">Zapisnik</Link>}>
            <ul className="divide-y divide-charcoal-100">
              {d.recentActivity.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 text-sm">
                  <span>
                    <span className="font-semibold text-navy-900">{a.username ?? "sistem"}</span>
                    <span className="ml-2 text-charcoal-700">{a.summary}</span>
                  </span>
                  <span className="text-xs text-charcoal-500">{formatDateTime(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </>
  );
}
