import type { Termin } from "@/sanity/types";

export const DAYS_OF_WEEK = [
  "Ponedjeljak",
  "Utorak",
  "Srijeda",
  "Četvrtak",
  "Petak",
  "Subota",
  "Nedjelja",
] as const;

export interface TimeWindow {
  startTime: string;
  endTime: string;
}

export interface DayBlockedWindows {
  dayOfWeek: (typeof DAYS_OF_WEEK)[number];
  windows: TimeWindow[];
}

/** Group sessions below this occupancy still leave the floor open to
 * commercial-gym members; at or above it, the group fills the space. */
const CAPACITY_THRESHOLD = 3;

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function toTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function mergeWindows(windows: TimeWindow[]): TimeWindow[] {
  const sorted = [...windows].sort(
    (a, b) => toMinutes(a.startTime) - toMinutes(b.startTime),
  );

  const merged: { start: number; end: number }[] = [];
  for (const window of sorted) {
    const start = toMinutes(window.startTime);
    const end = toMinutes(window.endTime);
    const last = merged.at(-1);
    if (last && start <= last.end) {
      last.end = Math.max(last.end, end);
    } else {
      merged.push({ start, end });
    }
  }

  return merged.map((m) => ({
    startTime: toTimeString(m.start),
    endTime: toTimeString(m.end),
  }));
}

/**
 * Derives when the floor is too full for commercial-gym (walk-in) access,
 * from the real group-training termini — there is no separate Sanity
 * content type for commercial-gym slots. A group session blocks the floor
 * only once it reaches 3+ occupied spots (out of however many max); below
 * that, and at any time with no group session at all, the gym is open to
 * commercial members within business hours.
 *
 * Cancelled/upcoming-but-not-yet-running sessions ("Otkazano", "Uskoro")
 * don't reflect real current occupancy, so they're excluded.
 */
export function getCommercialGymBlockedWindows(termini: Termin[]): DayBlockedWindows[] {
  const blockingTermini = termini.filter(
    (termin) =>
      termin.active &&
      (termin.status === "Slobodno" || termin.status === "Popunjeno") &&
      termin.maxParticipants - termin.spotsRemaining >= CAPACITY_THRESHOLD,
  );

  return DAYS_OF_WEEK.map((dayOfWeek) => ({
    dayOfWeek,
    windows: mergeWindows(
      blockingTermini
        .filter((termin) => termin.dayOfWeek === dayOfWeek)
        .map((termin) => ({ startTime: termin.startTime, endTime: termin.endTime })),
    ),
  }));
}
