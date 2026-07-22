import { CheckCircle2, Clock } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import type { DayBlockedWindows } from "@/lib/commercialGymSchedule";

const DAY_LABELS: Record<string, { bs: string; en: string }> = {
  Ponedjeljak: { bs: "Ponedjeljak", en: "Monday" },
  Utorak: { bs: "Utorak", en: "Tuesday" },
  Srijeda: { bs: "Srijeda", en: "Wednesday" },
  Četvrtak: { bs: "Četvrtak", en: "Thursday" },
  Petak: { bs: "Petak", en: "Friday" },
  Subota: { bs: "Subota", en: "Saturday" },
  Nedjelja: { bs: "Nedjelja", en: "Sunday" },
};

interface CommercialGymScheduleGridProps {
  days: DayBlockedWindows[];
  locale: Locale;
}

export function CommercialGymScheduleGrid({ days, locale }: CommercialGymScheduleGridProps) {
  const t = {
    openAllDay: locale === "bs" ? "Otvoreno cijelo radno vrijeme" : "Open all business hours",
    busyDuring: locale === "bs" ? "Zauzeto teretana u:" : "Gym floor busy during:",
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {days.map((day) => (
        <div
          key={day.dayOfWeek}
          className="clip-corner bg-white p-5 shadow-sm ring-1 ring-charcoal-200"
        >
          <p className="font-display text-sm uppercase tracking-wide text-navy-900">
            {DAY_LABELS[day.dayOfWeek]?.[locale] ?? day.dayOfWeek}
          </p>

          {day.windows.length === 0 ? (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-status-free-text">
              <CheckCircle2 className="size-4 shrink-0" aria-hidden />
              {t.openAllDay}
            </p>
          ) : (
            <div className="mt-3">
              <p className="text-xs text-charcoal-500">{t.busyDuring}</p>
              <ul className="mt-1.5 space-y-1">
                {day.windows.map((window) => (
                  <li
                    key={window.startTime}
                    className="flex items-center gap-1.5 text-sm text-status-full-text"
                  >
                    <Clock className="size-4 shrink-0" aria-hidden />
                    {window.startTime}–{window.endTime}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
