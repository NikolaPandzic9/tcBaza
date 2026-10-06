import { UserPlus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Card, PageHeader, Pill, buttonClass, formatDateTime, table } from "@/components/erp/ui";
import { requireUser } from "@/server/auth/current";
import { ROLE_LABELS } from "@/server/auth/permissions";
import { getDb } from "@/server/db/client";
import { listUsers } from "@/server/users";

export const metadata: Metadata = { title: "Korisnici" };

export default async function UsersPage() {
  await requireUser("users.manage");
  const rows = await listUsers(getDb());
  return (
    <>
      <PageHeader
        title="Korisnici"
        description="Ko ima pristup ERP-u i s kojom ulogom."
        actions={
          <Link href="/korisnici/novi" className={buttonClass("accent")}>
            <UserPlus className="size-4" aria-hidden />
            Novi korisnik
          </Link>
        }
      />
      <Card padded={false}>
        <div className={table.wrap}>
          <table className={table.table}>
            <thead>
              <tr>
                <th className={table.th}>Korisnik</th>
                <th className={table.th}>Uloga</th>
                <th className={table.th}>Status</th>
                <th className={table.th}>Zadnja prijava</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className={table.row}>
                  <td className={table.td}>
                    <Link href={`/korisnici/${u.id}`} className="font-semibold text-navy-900 hover:underline">
                      {u.displayName}
                    </Link>
                    <span className="block text-xs text-charcoal-500">@{u.username}</span>
                  </td>
                  <td className={table.td}>
                    <Pill tone={u.role === "admin" ? "navy" : u.role === "urednik" ? "lime" : "gray"}>{ROLE_LABELS[u.role]}</Pill>
                  </td>
                  <td className={table.td}>{u.active ? <Pill tone="green">Aktivan</Pill> : <Pill tone="gray">Deaktiviran</Pill>}</td>
                  <td className={`${table.td} text-xs text-charcoal-500`}>{formatDateTime(u.lastLoginAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
