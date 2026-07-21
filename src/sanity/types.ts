export type TerminStatus = "Slobodno" | "Popunjeno" | "Otkazano" | "Uskoro";

export type TerminColorTag =
  | "Navy"
  | "Zelena"
  | "Jantar"
  | "Crvena"
  | "Siva"
  | "Tirkizna";

export interface Termin {
  _id: string;
  programName: string;
  dayOfWeek: string;
  specificDate?: string;
  startTime: string;
  endTime: string;
  trainerName?: string;
  maxParticipants: number;
  spotsRemaining: number;
  status: TerminStatus;
  note?: string;
  colorTag: TerminColorTag;
  displayOrder: number;
  featured: boolean;
  active: boolean;
}

export interface SiteSettings {
  terminiSectionEnabled: boolean;
  showOnlyActiveTermini: boolean;
}
