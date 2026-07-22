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
      validation: (rule) =>
        rule
          .required()
          .custom(async (value, context) => {
            const docId = context.document?._id;
            if (!value || !docId) return true;
            const baseId = docId.replace(/^drafts\./, "");
            const client = context.getClient({ apiVersion: "2026-01-01" });
            const duplicate = await client.fetch(
              `count(*[_type == "trainer" && !(_id in [$baseId, $draftId]) && name == $name])`,
              { baseId, draftId: `drafts.${baseId}`, name: value },
            );
            return duplicate > 0
              ? "Trener sa ovim imenom već postoji."
              : true;
          }),
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
