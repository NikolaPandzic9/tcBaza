import { UserMinus } from "lucide-react";
import Link from "next/link";
import { ConfirmSubmit } from "@/components/erp/client";
import { Card, Pill, formatDate } from "@/components/erp/ui";
import { requireUser } from "@/server/auth/current";
import { can } from "@/server/auth/permissions";
import type { TerminData } from "@/server/content/schemas";
import { getDb } from "@/server/db/client";
import { listEnrolled } from "@/server/members/enrollments";
import { unenrollAction } from "./actions";
import { EnrollMember } from "./EnrollMember";

export async function TerminEnrollments({ terminId, termin }: { terminId: string; termin: TerminData }) {
  const { user } = await requireUser("termini.view");
  const enrolled = await listEnrolled(getDb(), terminId);
  const activeCount = enrolled.filter((e) => e.active).length;
  const free = Math.max(termin.maxParticipants - activeCount, 0);
  const canManage = can(user.role, "enrollments.manage");

  return (
    <Card
      title="Upisani članovi"
      actions={
        <Pill tone={free === 0 ? "red" : "green"}>
          {activeCount}/{termin.maxParticipants} · slobodno {free}
        </Pill>
      }
    >
      {enrolled.length === 0 ? (
        <p className="text-sm text-charcoal-500">Niko još nije upisan — na sajtu se prikazuje {termin.maxParticipants} slobodnih mjesta.</p>
      ) : (
        <ul className="divide-y divide-charcoal-100">
          {enrolled.map((e) => (
            <li key={e.enrollmentId} className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-sm">
              <span>
                <Link href={`/clanovi/${e.memberId}`} className="font-semibold text-navy-900 hover:underline">
                  {e.firstName} {e.lastName}
                </Link>
                {!e.active && (
                  <span className="ml-2">
                    <Pill tone="gray">neaktivan — ne zauzima mjesto</Pill>
                  </span>
                )}
                <span className="ml-2 text-xs text-charcoal-500">od {formatDate(e.createdAt)}</span>
              </span>
              {canManage && (
                <form action={unenrollAction.bind(null, terminId, e.memberId)}>
                  <ConfirmSubmit message={`Ispisati ${e.firstName} ${e.lastName} s ovog termina?`} variant="ghost">
                    <UserMinus className="size-3.5" aria-hidden />
                    Ispiši
                  </ConfirmSubmit>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
      {canManage && (
        <div className="mt-5 border-t border-charcoal-100 pt-5">
          <EnrollMember terminId={terminId} full={free === 0} />
        </div>
      )}
    </Card>
  );
}
