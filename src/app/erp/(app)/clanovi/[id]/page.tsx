import { Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmSubmit } from "@/components/erp/client";
import { Card, EmptyState, PageHeader, Pill, formatDate, formatKM, table } from "@/components/erp/ui";
import { requireUser } from "@/server/auth/current";
import { can } from "@/server/auth/permissions";
import { listDrafts } from "@/server/content/documents";
import type { TerminData } from "@/server/content/schemas";
import { getDb } from "@/server/db/client";
import { PAYMENT_METHOD_LABELS, getMember, membershipState, todayIso } from "@/server/members/members";
import {
  addMembershipAction,
  addPaymentAction,
  deleteMemberAction,
  deleteMembershipAction,
  deletePaymentAction,
  updateMemberAction,
} from "../actions";
import { MemberForm, MembershipForm, PaymentForm, type TierOption } from "../MemberForms";
import { MEMBERSHIP_STATE } from "../state";

export const metadata: Metadata = { title: "Član" };

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = await requireUser("members.view");
  const { id } = await params;
  const db = getDb();
  const [data, programs] = await Promise.all([getMember(db, id), listDrafts(db, "program")]);
  if (!data) notFound();
  const { member, memberships, payments, enrollments } = data;

  const today = todayIso();
  const canEdit = can(user.role, "members.edit");
  const canPay = can(user.role, "payments.manage");
  const programNames = new Map(programs.map((p) => [p.key ?? "", p.data.name.bs]));
  const tiers: TierOption[] = programs
    .filter((p) => p.key)
    .sort((a, b) => a.data.order - b.data.order)
    .flatMap((p) => p.data.tiers.map((t) => ({ programKey: p.key!, programName: p.data.name.bs, label: t.label.bs, price: t.price })));
  const paid = payments.reduce((sum, p) => sum + p.amount, 0);
  const current = membershipState(memberships[0] ?? null, today);

  return (
    <>
      <PageHeader
        title={`${member.firstName} ${member.lastName}`}
        back={{ href: "/clanovi", label: "Članovi" }}
        description={`Član od ${formatDate(member.createdAt)} · ukupno uplaćeno ${formatKM(paid)}`}
        actions={
          <>
            <Pill tone={MEMBERSHIP_STATE[current].tone}>{MEMBERSHIP_STATE[current].label}</Pill>
            {!member.active && <Pill tone="gray">Neaktivan</Pill>}
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          <Card title="Članarine" padded={false}>
            {memberships.length === 0 ? (
              <EmptyState title="Bez članarine" />
            ) : (
              <div className={table.wrap}>
                <table className={table.table}>
                  <thead>
                    <tr>
                      <th className={table.th}>Članarina</th>
                      <th className={table.th}>Period</th>
                      <th className={table.th}>Cijena</th>
                      <th className={table.th}>Status</th>
                      {canEdit && <th className={table.th}><span className="sr-only">Akcije</span></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {memberships.map((m) => {
                      const state = MEMBERSHIP_STATE[membershipState(m, today)];
                      return (
                        <tr key={m.id} className={table.row}>
                          <td className={table.td}>
                            <span className="font-semibold text-navy-900">{m.label}</span>
                            <span className="block text-xs text-charcoal-500">{programNames.get(m.programKey) ?? m.programKey}</span>
                          </td>
                          <td className={`${table.td} whitespace-nowrap text-xs`}>
                            {formatDate(m.startDate)} – {formatDate(m.endDate)}
                          </td>
                          <td className={table.td}>{formatKM(m.price)}</td>
                          <td className={table.td}>
                            <Pill tone={state.tone}>{state.label}</Pill>
                          </td>
                          {canEdit && (
                            <td className={`${table.td} text-right`}>
                              <form action={deleteMembershipAction.bind(null, member.id, m.id)}>
                                <ConfirmSubmit message={`Obrisati članarinu „${m.label}“?`} variant="ghost" aria-label="Obriši članarinu">
                                  <Trash2 className="size-3.5" />
                                </ConfirmSubmit>
                              </form>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {canEdit && (
              <div className="border-t border-charcoal-100 p-5 sm:p-6">
                <h3 className="mb-4 font-display text-sm uppercase tracking-wide text-navy-900">Nova članarina / produženje</h3>
                {tiers.length > 0 ? (
                  <MembershipForm action={addMembershipAction.bind(null, member.id)} tiers={tiers} today={today} canPay={canPay} />
                ) : (
                  <p className="text-sm text-charcoal-500">Nema programa u cjenovniku.</p>
                )}
              </div>
            )}
          </Card>

          <Card title="Uplate" padded={false} actions={<span className="text-sm font-semibold text-navy-900">{formatKM(paid)}</span>}>
            {payments.length === 0 ? (
              <EmptyState title="Nema uplata" />
            ) : (
              <div className={table.wrap}>
                <table className={table.table}>
                  <thead>
                    <tr>
                      <th className={table.th}>Datum</th>
                      <th className={table.th}>Iznos</th>
                      <th className={table.th}>Način</th>
                      <th className={table.th}>Napomena</th>
                      {canPay && <th className={table.th}><span className="sr-only">Akcije</span></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className={table.row}>
                        <td className={table.td}>{formatDate(p.paidAt)}</td>
                        <td className={`${table.td} font-semibold text-navy-900`}>{formatKM(p.amount)}</td>
                        <td className={table.td}>{PAYMENT_METHOD_LABELS[p.method as keyof typeof PAYMENT_METHOD_LABELS] ?? p.method}</td>
                        <td className={`${table.td} text-xs text-charcoal-500`}>
                          {p.note ?? (p.membershipId ? memberships.find((m) => m.id === p.membershipId)?.label : "—")}
                        </td>
                        {canPay && (
                          <td className={`${table.td} text-right`}>
                            <form action={deletePaymentAction.bind(null, member.id, p.id)}>
                              <ConfirmSubmit message={`Obrisati uplatu od ${formatKM(p.amount)}?`} variant="ghost" aria-label="Obriši uplatu">
                                <Trash2 className="size-3.5" />
                              </ConfirmSubmit>
                            </form>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {canPay && (
              <div className="border-t border-charcoal-100 p-5 sm:p-6">
                <h3 className="mb-4 font-display text-sm uppercase tracking-wide text-navy-900">Nova uplata</h3>
                <PaymentForm
                  action={addPaymentAction.bind(null, member.id)}
                  memberships={memberships.map((m) => ({ id: m.id, label: m.label, price: m.price }))}
                  today={today}
                />
              </div>
            )}
          </Card>
        </div>

        <aside className="space-y-6">
          <Card title="Podaci">
            {canEdit ? (
              <MemberForm action={updateMemberAction.bind(null, member.id)} initial={member} submitLabel="Sačuvaj izmjene" />
            ) : (
              <dl className="space-y-2 text-sm">
                <div><dt className="text-xs text-charcoal-500">Telefon</dt><dd>{member.phone ?? "—"}</dd></div>
                <div><dt className="text-xs text-charcoal-500">Email</dt><dd>{member.email ?? "—"}</dd></div>
                <div><dt className="text-xs text-charcoal-500">Roditelj / staratelj</dt><dd>{member.guardianName ?? "—"} {member.guardianPhone ?? ""}</dd></div>
                <div><dt className="text-xs text-charcoal-500">Napomena</dt><dd>{member.note ?? "—"}</dd></div>
              </dl>
            )}
          </Card>

          <Card title="Termini">
            {enrollments.length === 0 ? (
              <p className="text-sm text-charcoal-500">Nije upisan/a ni na jedan termin. Upis se radi na stranici termina.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {enrollments.map((e) => {
                  const t = e.termin as TerminData;
                  return (
                    <li key={e.id}>
                      <Link href={`/termini/${e.terminId}`} className="font-semibold text-navy-900 hover:underline">
                        {t.dayOfWeek} {t.startTime}–{t.endTime}
                      </Link>
                      <span className="ml-2 text-xs text-charcoal-500">
                        {programNames.get(t.programKey) ?? t.programKey}
                        {t.group?.bs ? ` ${t.group.bs}` : ""}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {canEdit && (
            <Card title="Brisanje">
              <p className="mb-4 text-xs text-charcoal-500">
                Trajno briše člana i sve njegove lične podatke, članarine, uplate i upise na termine (npr. na zahtjev člana po GDPR-u).
                Za privremeni prestanak koristi „Aktivan član“.
              </p>
              <form action={deleteMemberAction.bind(null, member.id)}>
                <ConfirmSubmit message={`Trajno obrisati ${member.firstName} ${member.lastName} i sve povezane podatke?`} size="md" className="w-full">
                  <Trash2 className="size-4" aria-hidden />
                  Obriši člana
                </ConfirmSubmit>
              </form>
            </Card>
          )}
        </aside>
      </div>
    </>
  );
}
