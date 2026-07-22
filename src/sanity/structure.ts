import { CalendarClock, CalendarRange, Settings } from "lucide-react";
import type { StructureResolver } from "sanity/structure";

const DAYS = [
  "Ponedjeljak",
  "Utorak",
  "Srijeda",
  "Četvrtak",
  "Petak",
  "Subota",
  "Nedjelja",
] as const;

/**
 * Custom desk structure so a non-technical admin only ever sees "Termini"
 * and "Podešavanja" — not the generic list of every schema type. Trainer
 * is deliberately not listed here; it's edited inline via the termin's
 * "Trener" reference field, since its only job is to power that dropdown.
 *
 * Termini get grouped into one section per weekday (in real Monday-to-
 * Sunday order) instead of a single flat list — dayOfWeek is a plain
 * string field, so Sanity's own list ordering would otherwise sort it
 * alphabetically ("Četvrtak" before "Nedjelja"), not chronologically.
 * A flat "Svi termini" view (sorted by start time) stays available too.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Trening centar Baza")
    .items([
      S.listItem()
        .title("Termini po danima")
        .icon(CalendarRange)
        .child(
          S.list()
            .title("Termini po danima")
            .items(
              DAYS.map((day) =>
                S.listItem()
                  .title(day)
                  .child(
                    S.documentTypeList("termin")
                      .title(day)
                      .filter("_type == \"termin\" && dayOfWeek == $day")
                      .params({ day })
                      .defaultOrdering([{ field: "startTime", direction: "asc" }]),
                  ),
              ),
            ),
        ),
      S.listItem()
        .title("Svi termini")
        .icon(CalendarClock)
        .child(
          S.documentTypeList("termin")
            .title("Svi termini")
            .defaultOrdering([{ field: "startTime", direction: "asc" }]),
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
