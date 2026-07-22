import { Settings } from "lucide-react";
import { defineField, defineType } from "sanity";

/**
 * Singleton document (fixed id "siteSettings", see structure.ts — Studio
 * navigation hides create/delete for it so there's only ever one).
 */
export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Podešavanja",
  type: "document",
  icon: Settings,
  fields: [
    defineField({
      name: "terminiSectionEnabled",
      title: "Prikaži sekciju \"Dostupni termini\" na sajtu",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "showOnlyActiveTermini",
      title: "Prikaži samo aktivne termine",
      description: "Kad je isključeno, prikazuju se i sakriveni termini (korisno za pregled).",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: { terminiOn: "terminiSectionEnabled" },
    prepare: ({ terminiOn }) => ({
      title: "Podešavanja sajta",
      subtitle: terminiOn ? "Termini: uključeni" : "Termini: isključeni",
    }),
  },
});
