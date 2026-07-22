import { CalendarClock } from "lucide-react";
import { defineField, defineType } from "sanity";

const PROGRAM_OPTIONS = [
  "Rekreativci 18+",
  "Rekreativci do 18",
  "Sportisti 14-19",
  "Sportisti 19+",
  "Komercijalna teretana",
  "Kik boks",
] as const;

const DAY_OPTIONS = [
  "Ponedjeljak",
  "Utorak",
  "Srijeda",
  "Četvrtak",
  "Petak",
  "Subota",
  "Nedjelja",
] as const;

const STATUS_OPTIONS = ["Slobodno", "Popunjeno", "Otkazano", "Uskoro"] as const;

const COLOR_TAG_OPTIONS = [
  "Navy",
  "Zelena",
  "Jantar",
  "Crvena",
  "Siva",
  "Tirkizna",
] as const;

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

function toMinutes(time: string): number | null {
  const match = TIME_REGEX.exec(time);
  if (!match) return null;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export const terminType = defineType({
  name: "termin",
  title: "Termin",
  type: "document",
  icon: CalendarClock,
  groups: [
    { name: "osnovno", title: "Osnovno", default: true },
    { name: "kapacitet", title: "Kapacitet i status" },
    { name: "prikaz", title: "Prikaz na sajtu" },
  ],
  fields: [
    defineField({
      name: "programName",
      title: "Naziv programa",
      type: "string",
      group: "osnovno",
      options: { list: [...PROGRAM_OPTIONS] },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "dayOfWeek",
      title: "Dan u sedmici",
      type: "string",
      group: "osnovno",
      options: { list: [...DAY_OPTIONS] },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "specificDate",
      title: "Konkretan datum (opciono)",
      description:
        "Popuni samo ako ovaj termin važi za jedan konkretan datum, a ne za sedmičnu šemu.",
      type: "date",
      group: "osnovno",
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) return true;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (new Date(value) < today) {
            return "Ovaj datum je već prošao — provjeri da li je greška.";
          }
          return true;
        }).warning(),
    }),
    defineField({
      name: "startTime",
      title: "Vrijeme početka",
      type: "string",
      group: "osnovno",
      description: "Format HH:MM, npr. 18:00",
      validation: (rule) =>
        rule
          .required()
          .regex(TIME_REGEX, { name: "vrijeme (HH:MM)" }),
    }),
    defineField({
      name: "endTime",
      title: "Vrijeme završetka",
      type: "string",
      group: "osnovno",
      description: "Format HH:MM, npr. 19:30",
      validation: (rule) =>
        rule
          .required()
          .regex(TIME_REGEX, { name: "vrijeme (HH:MM)" })
          .custom((value, context) => {
            const start = (context.document as { startTime?: string })?.startTime;
            if (!value || !start) return true;
            const startMinutes = toMinutes(start);
            const endMinutes = toMinutes(value);
            if (startMinutes === null || endMinutes === null) return true;
            if (endMinutes <= startMinutes) {
              return "Vrijeme završetka mora biti poslije vremena početka.";
            }
            return true;
          }),
    }),
    defineField({
      name: "trainer",
      title: "Trener",
      type: "reference",
      group: "kapacitet",
      to: [{ type: "trainer" }],
      description: "Obavezno za sve grupne treninge; nije potrebno za komercijalnu teretanu.",
      validation: (rule) =>
        rule.custom((value, context) => {
          const programName = (context.document as { programName?: string })?.programName;
          if (programName && programName !== "Komercijalna teretana" && !value) {
            return "Potreban je trener za grupne treninge.";
          }
          return true;
        }),
    }),
    defineField({
      name: "maxParticipants",
      title: "Maksimalan broj učesnika",
      type: "number",
      group: "kapacitet",
      validation: (rule) => [
        rule.required().min(1).integer(),
        rule
          .custom((value, context) => {
            const programName = (context.document as { programName?: string })?.programName;
            if (
              typeof value === "number" &&
              programName &&
              programName !== "Komercijalna teretana" &&
              value > 5
            ) {
              return "Grupni treninzi su po konceptu ograničeni na 5 članova — provjeri da li je namjerno veći broj.";
            }
            return true;
          })
          .warning(),
      ],
    }),
    defineField({
      name: "spotsRemaining",
      title: "Broj slobodnih mjesta",
      type: "number",
      group: "kapacitet",
      validation: (rule) =>
        rule
          .required()
          .min(0)
          .integer()
          .custom((value, context) => {
            const max = (context.document as { maxParticipants?: number })
              ?.maxParticipants;
            if (typeof value === "number" && typeof max === "number" && value > max) {
              return "Ne može biti veće od maksimalnog broja učesnika.";
            }
            return true;
          }),
    }),
    defineField({
      name: "status",
      title: "Status termina",
      type: "string",
      group: "kapacitet",
      options: { list: [...STATUS_OPTIONS], layout: "radio" },
      initialValue: "Slobodno",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "note",
      title: "Kratak opis ili napomena",
      type: "text",
      group: "prikaz",
      rows: 2,
    }),
    defineField({
      name: "colorTag",
      title: "Boja / kategorija",
      description: "Za lakše vizuelno razlikovanje termina u rasporedu.",
      type: "string",
      group: "prikaz",
      options: { list: [...COLOR_TAG_OPTIONS] },
      initialValue: "Navy",
    }),
    defineField({
      name: "displayOrder",
      title: "Redoslijed prikaza",
      description:
        "Koristi se samo kao rezerva kad su dva termina istog dana u isto vrijeme.",
      type: "number",
      group: "prikaz",
      initialValue: 0,
    }),
    defineField({
      name: "featured",
      title: "Preporučeno (Featured)",
      type: "boolean",
      group: "prikaz",
      initialValue: false,
    }),
    defineField({
      name: "active",
      title: "Aktivan (prikazan na sajtu)",
      description:
        "Isključi da privremeno sakriješ termin bez brisanja — može se kasnije ponovo uključiti.",
      type: "boolean",
      group: "prikaz",
      initialValue: true,
    }),
  ],
  validation: (rule) =>
    rule.custom(async (doc, context) => {
      if (!doc?.programName || !doc?.dayOfWeek || !doc?.startTime) return true;
      const baseId = doc._id.replace(/^drafts\./, "");
      const client = context.getClient({ apiVersion: "2026-01-01" });
      const duplicate = await client.fetch(
        `count(*[_type == "termin" && !(_id in [$baseId, $draftId]) && programName == $programName && dayOfWeek == $dayOfWeek && startTime == $startTime])`,
        {
          baseId,
          draftId: `drafts.${baseId}`,
          programName: doc.programName,
          dayOfWeek: doc.dayOfWeek,
          startTime: doc.startTime,
        },
      );
      if (duplicate > 0) {
        return "Već postoji termin za ovaj program, dan i vrijeme početka — provjeri da nije duplikat.";
      }
      return true;
    }).warning(),
  orderings: [
    {
      title: "Vrijeme početka",
      name: "startTime",
      by: [{ field: "startTime", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "programName",
      day: "dayOfWeek",
      start: "startTime",
      end: "endTime",
      status: "status",
      active: "active",
    },
    prepare({ title, day, start, end, status, active }) {
      return {
        title: `${title ?? "Bez naziva"} — ${day ?? ""} ${start ?? ""}–${end ?? ""}`,
        subtitle: active ? status : `${status} · SAKRIVENO`,
      };
    },
  },
});
