import type { Localized } from "@/content/programs";

export const TERMIN_DAYS = [
  "Ponedjeljak",
  "Utorak",
  "Srijeda",
  "Četvrtak",
  "Petak",
  "Subota",
  "Nedjelja",
] as const;

export type TerminStatus = "Slobodno" | "Popunjeno" | "Otkazano" | "Uskoro";

export type TerminColorTag = "Navy" | "Zelena" | "Jantar" | "Crvena" | "Siva" | "Tirkizna";

/** A session as the public schedule renders it. Free spots are derived
 * from the members enrolled in the ERP, not typed in by hand. */
export interface Termin {
  id: string;
  programKey: string;
  programName: Localized;
  dayOfWeek: (typeof TERMIN_DAYS)[number];
  specificDate: string | null;
  startTime: string;
  endTime: string;
  trainerName: string | null;
  maxParticipants: number;
  spotsRemaining: number;
  status: TerminStatus;
  note: string;
  colorTag: TerminColorTag;
  displayOrder: number;
  featured: boolean;
  active: boolean;
}

export interface ScheduleData {
  enabled: boolean;
  termini: Termin[];
  /** Occupied spots at which a group session blocks the open gym floor. */
  commercialGymThreshold: number;
}
