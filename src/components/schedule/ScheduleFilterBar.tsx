"use client";

import { cn } from "@/lib/cn";

const DAYS = [
  "Ponedjeljak",
  "Utorak",
  "Srijeda",
  "Četvrtak",
  "Petak",
  "Subota",
  "Nedjelja",
] as const;

const DAY_LABELS: Record<(typeof DAYS)[number], { bs: string; en: string }> = {
  Ponedjeljak: { bs: "Pon", en: "Mon" },
  Utorak: { bs: "Uto", en: "Tue" },
  Srijeda: { bs: "Sri", en: "Wed" },
  Četvrtak: { bs: "Čet", en: "Thu" },
  Petak: { bs: "Pet", en: "Fri" },
  Subota: { bs: "Sub", en: "Sat" },
  Nedjelja: { bs: "Ned", en: "Sun" },
};

interface ScheduleFilterBarProps {
  activeDay: string | null;
  onChange: (day: string | null) => void;
  locale: "bs" | "en";
}

export function ScheduleFilterBar({ activeDay, onChange, locale }: ScheduleFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          "px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors",
          activeDay === null
            ? "bg-navy-700 text-white"
            : "bg-white text-charcoal-500 ring-1 ring-charcoal-100 hover:text-navy-700",
        )}
      >
        {locale === "bs" ? "Svi dani" : "All days"}
      </button>
      {DAYS.map((day) => (
        <button
          key={day}
          type="button"
          onClick={() => onChange(day)}
          className={cn(
            "px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors",
            activeDay === day
              ? "bg-navy-700 text-white"
              : "bg-white text-charcoal-500 ring-1 ring-charcoal-100 hover:text-navy-700",
          )}
        >
          {DAY_LABELS[day][locale]}
        </button>
      ))}
    </div>
  );
}
