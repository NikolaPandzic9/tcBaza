import { UserRound } from "lucide-react";
import { defineField, defineType } from "sanity";

/**
 * Deliberately minimal: this type exists so the Studio admin gets a
 * typo-proof dropdown when assigning a trainer to a termin. The public
 * team page is static (src/content/team.ts) since bios/certificates
 * aren't available yet — this is not used to render it.
 */
export const trainerType = defineType({
  name: "trainer",
  title: "Trener",
  type: "document",
  icon: UserRound,
  fields: [
    defineField({
      name: "name",
      title: "Ime i prezime",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "photo",
      title: "Fotografija",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "order",
      title: "Redoslijed",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: {
    select: { title: "name", media: "photo" },
  },
});
