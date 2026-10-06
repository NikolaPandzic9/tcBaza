import { Mail, Phone, Trash2, UserPlus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmSubmit, SubmitButton } from "@/components/erp/client";
import { Card, PageHeader, Pill, buttonClass, formatDateTime, inputClass } from "@/components/erp/ui";
import { requireUser } from "@/server/auth/current";
import { can } from "@/server/auth/permissions";
import { getDb } from "@/server/db/client";
import { INQUIRY_STATUSES, INQUIRY_STATUS_LABELS, getInquiry } from "@/server/inquiries";
import { deleteInquiryAction, updateInquiryAction } from "../actions";
import { INQUIRY_TONE } from "../tone";

export const metadata: Metadata = { title: "Upit" };

export default async function InquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = await requireUser("inquiries.manage");
  const { id } = await params;
  const inquiry = await getInquiry(getDb(), id);
  if (!inquiry) notFound();

  return (
    <>
      <PageHeader
        title={inquiry.name}
        back={{ href: "/upiti", label: "Upiti" }}
        description={`Primljeno ${formatDateTime(inquiry.createdAt)} · jezik sajta: ${inquiry.locale.toUpperCase()}${inquiry.emailSent ? " · poslano i emailom" : ""}`}
        actions={<Pill tone={INQUIRY_TONE[inquiry.status]}>{INQUIRY_STATUS_LABELS[inquiry.status]}</Pill>}
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card title="Poruka">
          {/* Plain text — never rendered as HTML. */}
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-charcoal-900">{inquiry.message}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <a href={`mailto:${inquiry.email}?subject=${encodeURIComponent("Odgovor — Trening centar Baza")}`} className={buttonClass("primary", "sm")}>
              <Mail className="size-4" aria-hidden />
              {inquiry.email}
            </a>
            {inquiry.phone && (
              <a href={`tel:${inquiry.phone.replace(/[^\d+]/g, "")}`} className={buttonClass("ghost", "sm")}>
                <Phone className="size-4" aria-hidden />
                {inquiry.phone}
              </a>
            )}
            {can(user.role, "members.edit") && (
              <Link href="/clanovi/novi" className={buttonClass("ghost", "sm")}>
                <UserPlus className="size-4" aria-hidden />
                Upiši kao člana
              </Link>
            )}
          </div>
        </Card>

        <aside className="space-y-6">
          <Card title="Obrada">
            <form action={updateInquiryAction.bind(null, inquiry.id)} className="space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-wide text-navy-900">
                Status
                <select name="status" defaultValue={inquiry.status} className={`${inputClass} mt-1.5`}>
                  {INQUIRY_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {INQUIRY_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wide text-navy-900">
                Interna bilješka
                <textarea name="internalNote" rows={4} defaultValue={inquiry.internalNote ?? ""} className={`${inputClass} mt-1.5`} />
              </label>
              <SubmitButton variant="accent" className="w-full">
                Sačuvaj
              </SubmitButton>
            </form>
          </Card>
          <form action={deleteInquiryAction.bind(null, inquiry.id)}>
            <ConfirmSubmit message="Trajno obrisati ovaj upit?" size="md" className="w-full">
              <Trash2 className="size-4" aria-hidden />
              Obriši upit
            </ConfirmSubmit>
          </form>
        </aside>
      </div>
    </>
  );
}
