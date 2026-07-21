"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/i18n/routing";
import type { Termin } from "@/sanity/types";
import { ScheduleFilterBar } from "./ScheduleFilterBar";
import { TerminCard } from "./TerminCard";

interface ScheduleGridProps {
  termini: Termin[];
  locale: Locale;
}

export function ScheduleGrid({ termini, locale }: ScheduleGridProps) {
  const [activeDay, setActiveDay] = useState<string | null>(null);

  const filtered = useMemo(
    () => (activeDay ? termini.filter((t) => t.dayOfWeek === activeDay) : termini),
    [termini, activeDay],
  );

  return (
    <div>
      <ScheduleFilterBar activeDay={activeDay} onChange={setActiveDay} locale={locale} />

      {filtered.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((termin) => (
            <TerminCard key={termin._id} termin={termin} locale={locale} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-sm text-charcoal-500">
          {locale === "bs"
            ? "Nema termina za odabrani dan."
            : "No sessions for the selected day."}
        </p>
      )}
    </div>
  );
}
