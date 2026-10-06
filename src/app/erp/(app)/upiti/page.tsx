import type { Metadata } from "next";
import Link from "next/link";
import { FilterSelect, SearchInput } from "@/components/erp/client";
import { Card, EmptyState, PageHeader, Pagination, Pill, formatDateTime, param, table, type SearchParams } from "@/components/erp/ui";
import { requireUser } from "@/server/auth/current";
import { getDb } from "@/server/db/client";
import { INQUIRY_STATUSES, INQUIRY_STATUS_LABELS, listInquiries, type InquiryStatus } from "@/server/inquiries";
import { INQUIRY_TONE } from "./tone";

export const metadata: Metadata = { title: "Upiti" };

export default async function InquiriesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireUser("inquiries.manage");
  const params = await searchParams;
  const status = param(params, "status") as InquiryStatus | undefined;
  const result = await listInquiries(getDb(), {
    q: param(params, "q"),
    status: status && INQUIRY_STATUSES.includes(status) ? status : undefined,
    page: Number(param(params, "page") ?? 1) || 1,
  });

  return (
    <>
      <PageHeader title="Upiti" description="Poruke poslane preko kontakt forme na sajtu." />
      <Card padded={false}>
        <div className="flex flex-wrap items-center gap-3 border-b border-charcoal-100 px-4 py-3">
          <SearchInput placeholder="Ime, email, poruka…" />
          <FilterSelect param="status" label="Status" options={INQUIRY_STATUSES.map((s) => ({ value: s, label: INQUIRY_STATUS_LABELS[s] }))} />
        </div>
        {result.items.length === 0 ? (
          <EmptyState title="Nema upita" />
        ) : (
          <div className={table.wrap}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th className={table.th}>Pošiljalac</th>
                  <th className={table.th}>Poruka</th>
                  <th className={table.th}>Status</th>
                  <th className={table.th}>Primljeno</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((q) => (
                  <tr key={q.id} className={table.row}>
                    <td className={table.td}>
                      <Link href={`/upiti/${q.id}`} className={`text-navy-900 hover:underline ${q.status === "novo" ? "font-bold" : "font-semibold"}`}>
                        {q.name}
                      </Link>
                      <span className="block text-xs text-charcoal-500">{q.email}</span>
                    </td>
                    <td className={`${table.td} max-w-md`}>
                      <span className="line-clamp-2 text-xs text-charcoal-700">{q.message}</span>
                    </td>
                    <td className={table.td}>
                      <Pill tone={INQUIRY_TONE[q.status]}>{INQUIRY_STATUS_LABELS[q.status]}</Pill>
                    </td>
                    <td className={`${table.td} whitespace-nowrap text-xs text-charcoal-500`}>{formatDateTime(q.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination basePath="/upiti" params={params} page={result.page} pageCount={result.pageCount} total={result.total} />
      </Card>
    </>
  );
}
