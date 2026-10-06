import { Download, UserPlus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { FilterSelect, SearchInput } from "@/components/erp/client";
import {
  Card,
  EmptyState,
  PageHeader,
  Pagination,
  Pill,
  SortHeader,
  buttonClass,
  formatDate,
  param,
  table,
  withParams,
  type SearchParams,
} from "@/components/erp/ui";
import { requireUser } from "@/server/auth/current";
import { can } from "@/server/auth/permissions";
import { getDb } from "@/server/db/client";
import { listMembers, type MembershipState } from "@/server/members/members";
import { loadOptions } from "../_content/ContentPages";
import { MEMBERSHIP_STATE } from "./state";

export const metadata: Metadata = { title: "Članovi" };

export default async function MembersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { user } = await requireUser("members.view");
  const params = await searchParams;
  const sort = (param(params, "sort") as "name" | "newest" | "expiry" | undefined) ?? "name";
  const dir = param(params, "dir") === "desc" ? "desc" : "asc";
  const [result, options] = await Promise.all([
    listMembers(getDb(), {
      q: param(params, "q"),
      active: param(params, "active") as "da" | "ne" | undefined,
      state: param(params, "state") as MembershipState | undefined,
      program: param(params, "program"),
      sort,
      dir,
      page: Number(param(params, "page") ?? 1) || 1,
    }),
    loadOptions(),
  ]);

  return (
    <>
      <PageHeader
        title="Članovi"
        description="Evidencija članova, članarina i uplata."
        actions={
          <>
            {can(user.role, "members.edit") && (
              <a href={withParams("/izvoz/clanovi", params, { page: null, sort: null, dir: null })} className={buttonClass("ghost", "sm")}>
                <Download className="size-4" aria-hidden />
                CSV
              </a>
            )}
            {can(user.role, "members.edit") && (
              <Link href="/clanovi/novi" className={buttonClass("accent")}>
                <UserPlus className="size-4" aria-hidden />
                Novi član
              </Link>
            )}
          </>
        }
      />
      <Card padded={false}>
        <div className="flex flex-wrap items-center gap-3 border-b border-charcoal-100 px-4 py-3">
          <SearchInput placeholder="Ime, telefon, email…" />
          <FilterSelect
            param="state"
            label="Članarina"
            options={(Object.keys(MEMBERSHIP_STATE) as MembershipState[]).map((s) => ({ value: s, label: MEMBERSHIP_STATE[s].label }))}
          />
          <FilterSelect param="program" label="Program" options={options.programs} />
          <FilterSelect param="active" label="Aktivan" options={[{ value: "da", label: "Da" }, { value: "ne", label: "Ne" }]} />
        </div>

        {result.items.length === 0 ? (
          <EmptyState title="Nema članova">{param(params, "q") ? "Promijeni pretragu ili filtere." : "Dodaj prvog člana dugmetom iznad."}</EmptyState>
        ) : (
          <div className={table.wrap}>
            <table className={table.table}>
              <thead>
                <tr>
                  <SortHeader label="Ime i prezime" field="name" basePath="/clanovi" params={params} current={sort} dir={dir} />
                  <th className={table.th}>Kontakt</th>
                  <th className={table.th}>Zadnja članarina</th>
                  <SortHeader label="Ističe" field="expiry" basePath="/clanovi" params={params} current={sort} dir={dir} />
                  <SortHeader label="Dodan" field="newest" basePath="/clanovi" params={params} current={sort} dir={dir} />
                </tr>
              </thead>
              <tbody>
                {result.items.map((m) => {
                  const state = MEMBERSHIP_STATE[m.state];
                  return (
                    <tr key={m.id} className={table.row}>
                      <td className={table.td}>
                        <Link href={`/clanovi/${m.id}`} className="font-semibold text-navy-900 hover:underline">
                          {m.firstName} {m.lastName}
                        </Link>
                        {!m.active && (
                          <span className="ml-2">
                            <Pill tone="gray">Neaktivan</Pill>
                          </span>
                        )}
                      </td>
                      <td className={`${table.td} text-xs text-charcoal-500`}>
                        {m.phone ?? "—"}
                        {m.email && <span className="block">{m.email}</span>}
                      </td>
                      <td className={`${table.td} text-xs`}>{m.latest?.label ?? "—"}</td>
                      <td className={table.td}>
                        <span className="flex items-center gap-2">
                          <Pill tone={state.tone}>{state.label}</Pill>
                          {m.latest && <span className="text-xs text-charcoal-500">{formatDate(m.latest.endDate)}</span>}
                        </span>
                      </td>
                      <td className={`${table.td} text-xs text-charcoal-500`}>{formatDate(m.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination basePath="/clanovi" params={params} page={result.page} pageCount={result.pageCount} total={result.total} />
      </Card>
    </>
  );
}
