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

export const terminType = defineType({
  name: "termin",
  title: "Termin",
  type: "document",
  icon: CalendarClock,
  fields: [
    defineField({
      name: "programName",
      title: "Naziv programa",
      type: "string",
      options: { list: [...PROGRAM_OPTIONS] },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "dayOfWeek",
      title: "Dan u sedmici",
      type: "string",
      options: { list: [...DAY_OPTIONS] },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "specificDate",
      title: "Konkretan datum (opciono)",
      description:
        "Popuni samo ako ovaj termin važi za jedan konkretan datum, a ne za sedmičnu šemu.",
      type: "date",
    }),
    defineField({
      name: "startTime",
      title: "Vrijeme početka",
      type: "string",
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
      description: "Format HH:MM, npr. 19:30",
      validation: (rule) =>
        rule
          .required()
          .regex(TIME_REGEX, { name: "vrijeme (HH:MM)" }),
    }),
    defineField({
      name: "trainer",
      title: "Trener",
      type: "reference",
      to: [{ type: "trainer" }],
    }),
    defineField({
      name: "maxParticipants",
      title: "Maksimalan broj učesnika",
      type: "number",
      validation: (rule) => rule.required().min(1).integer(),
    }),
    defineField({
      name: "spotsRemaining",
      title: "Broj slobodnih mjesta",
      type: "number",
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
      options: { list: [...STATUS_OPTIONS], layout: "radio" },
      initialValue: "Slobodno",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "note",
      title: "Kratak opis ili napomena",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "colorTag",
      title: "Boja / kategorija",
      description: "Za lakše vizuelno razlikovanje termina u rasporedu.",
      type: "string",
      options: { list: [...COLOR_TAG_OPTIONS] },
      initialValue: "Navy",
    }),
    defineField({
      name: "displayOrder",
      title: "Redoslijed prikaza",
      description:
        "Koristi se samo kao rezerva kad su dva termina istog dana u isto vrijeme.",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "featured",
      title: "Preporučeno (Featured)",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "active",
      title: "Aktivan (prikazan na sajtu)",
      description:
        "Isključi da privremeno sakriješ termin bez brisanja — može se kasnije ponovo uključiti.",
      type: "boolean",
      initialValue: true,
    }),
  ],
  orderings: [
    {
      title: "Dan i vrijeme",
      name: "dayAndTime",
      by: [
        { field: "dayOfWeek", direction: "asc" },
        { field: "startTime", direction: "asc" },
        { field: "displayOrder", direction: "asc" },
      ],
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
