import { CalendarClock, Settings } from "lucide-react";
import type { StructureResolver } from "sanity/structure";

/**
 * Custom desk structure so a non-technical admin only ever sees "Termini"
 * and "Podešavanja" — not the generic list of every schema type. Trainer
 * is deliberately not listed here; it's edited inline via the termin's
 * "Trener" reference field, since its only job is to power that dropdown.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Trening centar Baza")
    .items([
      S.listItem()
        .title("Termini")
        .icon(CalendarClock)
        .child(
          S.documentTypeList("termin")
            .title("Termini")
            .defaultOrdering([{ field: "dayOfWeek", direction: "asc" }]),
        ),
      S.listItem()
        .title("Podešavanja")
        .icon(Settings)
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings"),
        ),
    ]);
