import { Download } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { FilterSelect } from "@/components/erp/client";
import {
  Card,
  EmptyState,
  PageHeader,
  Pagination,
  buttonClass,
  formatDate,
  formatKM,
  inputClass,
  param,
  table,
  withParams,
  type SearchParams,
} from "@/components/erp/ui";
import { requireUser } from "@/server/auth/current";
import { getDb } from "@/server/db/client";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, listPayments, todayIso } from "@/server/members/members";

export const metadata: Metadata = { title: "Uplate" };

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireUser("payments.manage");
  const params = await searchParams;
  const today = todayIso();
  const from = ISO.test(param(params, "from") ?? "") ? param(params, "from")! : `${today.slice(0, 7)}-01`;
  const to = ISO.test(param(params, "to") ?? "") ? param(params, "to")! : today;
  const result = await listPayments(getDb(), {
    from,
    to,
    method: param(params, "method"),
    page: Number(param(params, "page") ?? 1) || 1,
  });

  return (
    <>
      <PageHeader
        title="Uplate"
        description="Sve evidentirane uplate članova. Uplata se dodaje na stranici člana."
        actions={
          <a href={withParams("/izvoz/uplate", params, { from, to, page: null })} className={buttonClass("ghost", "sm")}>
            <Download className="size-4" aria-hidden />
            CSV
          </a>
        }
      />
      <Card padded={false}>
        {/* Plain GET form: the date range lives in the URL (bookmarkable, works without JS). */}
        <form method="get" className="flex flex-wrap items-end gap-3 border-b border-charcoal-100 px-4 py-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-navy-900">
            Od
            <input type="date" name="from" defaultValue={from} className={`${inputClass} mt-1 w-auto`} />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-navy-900">
            Do
            <input type="date" name="to" defaultValue={to} className={`${inputClass} mt-1 w-auto`} />
          </label>
          {param(params, "method") && <input type="hidden" name="method" value={param(params, "method")} />}
          <button type="submit" className={buttonClass("primary", "sm")}>
            Prikaži
          </button>
          <FilterSelect param="method" label="Način" options={PAYMENT_METHODS.map((m) => ({ value: m, label: PAYMENT_METHOD_LABELS[m] }))} />
          <p className="ml-auto text-sm">
            Ukupno za period: <strong className="font-display text-lg text-navy-900">{formatKM(result.sum)}</strong>
          </p>
        </form>

        {result.items.length === 0 ? (
          <EmptyState title="Nema uplata u ovom periodu" />
        ) : (
          <div className={table.wrap}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th className={table.th}>Datum</th>
                  <th className={table.th}>Član</th>
                  <th className={table.th}>Iznos</th>
                  <th className={table.th}>Način</th>
                  <th className={table.th}>Napomena</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map(({ payment, firstName, lastName }) => (
                  <tr key={payment.id} className={table.row}>
                    <td className={table.td}>{formatDate(payment.paidAt)}</td>
                    <td className={table.td}>
                      <Link href={`/clanovi/${payment.memberId}`} className="font-semibold text-navy-900 hover:underline">
                        {firstName} {lastName}
                      </Link>
                    </td>
                    <td className={`${table.td} font-semibold`}>{formatKM(payment.amount)}</td>
                    <td className={table.td}>{PAYMENT_METHOD_LABELS[payment.method as keyof typeof PAYMENT_METHOD_LABELS] ?? payment.method}</td>
                    <td className={`${table.td} text-xs text-charcoal-500`}>{payment.note ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination basePath="/uplate" params={{ ...params, from, to }} page={result.page} pageCount={result.pageCount} total={result.total} />
      </Card>
    </>
  );
}
