import { sql, type SQL } from "drizzle-orm";
import { contentDocuments } from "../db/schema";
import type { ContentDataMap, ContentType } from "./schemas";

const draft = contentDocuments.draft;
const field = (path: string): SQL => sql.raw(`(${"draft"}${path})`);

interface TypeMeta<T extends ContentType> {
  label: string;
  plural: string;
  /** Exactly one document, edited in place (no list/create/delete). */
  singleton: boolean;
  /** Program documents back fixed routes — they can be edited and hidden,
   * but not created or deleted from the ERP. */
  creatable: boolean;
  title: (data: ContentDataMap[T]) => string;
  /** Sortable columns, by key, mapped to an SQL expression on the draft. */
  sortFields: Record<string, { label: string; expr: SQL }>;
  /** Draft fields that list views may filter on with exact equality. */
  filterFields: readonly string[];
}

type Registry = { [T in ContentType]: TypeMeta<T> };

const updated = { label: "Izmijenjeno", expr: sql`${contentDocuments.updatedAt}` };
const orderField = { label: "Redoslijed", expr: sql`((${draft}->>'order')::int)` };

export const CONTENT_META: Registry = {
  program: {
    label: "Program",
    plural: "Programi",
    singleton: false,
    creatable: false,
    title: (d) => d.name.bs,
    sortFields: {
      order: orderField,
      name: { label: "Naziv", expr: field("->'name'->>'bs'") },
      updated,
    },
    filterFields: ["visible"],
  },
  teamMember: {
    label: "Član tima",
    plural: "Tim",
    singleton: false,
    creatable: true,
    title: (d) => d.name,
    sortFields: {
      order: orderField,
      name: { label: "Ime", expr: field("->>'name'") },
      updated,
    },
    filterFields: ["leadsSessions"],
  },
  partner: {
    label: "Partner",
    plural: "Partneri",
    singleton: false,
    creatable: true,
    title: (d) => d.name,
    sortFields: {
      order: orderField,
      name: { label: "Naziv", expr: field("->>'name'") },
      updated,
    },
    filterFields: [],
  },
  recoveryService: {
    label: "Usluga oporavka",
    plural: "Oporavak",
    singleton: false,
    creatable: true,
    title: (d) => d.name.bs,
    sortFields: {
      order: orderField,
      name: { label: "Naziv", expr: field("->'name'->>'bs'") },
      updated,
    },
    filterFields: [],
  },
  faqItem: {
    label: "Pitanje",
    plural: "Česta pitanja",
    singleton: false,
    creatable: true,
    title: (d) => d.question.bs,
    sortFields: {
      order: orderField,
      question: { label: "Pitanje", expr: field("->'question'->>'bs'") },
      updated,
    },
    filterFields: [],
  },
  termin: {
    label: "Termin",
    plural: "Termini",
    singleton: false,
    creatable: true,
    title: (d) => `${d.dayOfWeek} ${d.startTime}–${d.endTime}`,
    sortFields: {
      day: {
        label: "Dan i vrijeme",
        expr: sql`(array_position(array['Ponedjeljak','Utorak','Srijeda','Četvrtak','Petak','Subota','Nedjelja'], ${draft}->>'dayOfWeek') * 10000 + replace(${draft}->>'startTime', ':', '')::int)`,
      },
      program: { label: "Program", expr: field("->>'programKey'") },
      updated,
    },
    filterFields: ["dayOfWeek", "programKey", "trainerId", "status", "active"],
  },
  siteSettings: {
    label: "Podešavanja",
    plural: "Podešavanja",
    singleton: true,
    creatable: false,
    title: () => "Podešavanja sajta",
    sortFields: { updated },
    filterFields: [],
  },
};

export function documentTitle<T extends ContentType>(type: T, data: ContentDataMap[T]): string {
  return CONTENT_META[type].title(data);
}
