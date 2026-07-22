import { Clock, Users } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import type { Termin } from "@/sanity/types";
import { StatusBadge } from "./StatusBadge";

const DAY_LABELS: Record<string, { bs: string; en: string }> = {
  Ponedjeljak: { bs: "Ponedjeljak", en: "Monday" },
  Utorak: { bs: "Utorak", en: "Tuesday" },
  Srijeda: { bs: "Srijeda", en: "Wednesday" },
  Četvrtak: { bs: "Četvrtak", en: "Thursday" },
  Petak: { bs: "Petak", en: "Friday" },
  Subota: { bs: "Subota", en: "Saturday" },
  Nedjelja: { bs: "Nedjelja", en: "Sunday" },
};

interface TerminCardProps {
  termin: Termin;
  locale: Locale;
}

export function TerminCard({ termin, locale }: TerminCardProps) {
  const dayLabel = DAY_LABELS[termin.dayOfWeek]?.[locale] ?? termin.dayOfWeek;

  return (
    <div
      className="clip-corner flex flex-col gap-3 bg-white p-5 shadow-sm ring-1 ring-charcoal-200"
      data-featured={termin.featured || undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-sm uppercase tracking-wide text-navy-900">
            {termin.programName}
          </p>
          <p className="mt-1 text-sm text-charcoal-500">{dayLabel}</p>
        </div>
        <StatusBadge status={termin.status} locale={locale} />
      </div>

      <div className="flex items-center gap-4 text-sm text-charcoal-700">
        <span className="flex items-center gap-1.5">
          <Clock className="size-4 text-charcoal-500" aria-hidden />
          {termin.startTime}–{termin.endTime}
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="size-4 text-charcoal-500" aria-hidden />
          {termin.maxParticipants - termin.spotsRemaining}/{termin.maxParticipants}
        </span>
      </div>

      {termin.trainerName && (
        <p className="text-xs text-charcoal-500">{termin.trainerName}</p>
      )}
      {termin.note && <p className="text-xs text-charcoal-500">{termin.note}</p>}
    </div>
  );
}
