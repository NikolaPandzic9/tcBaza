import { client } from "./client";
import { sanityIsConfigured } from "./env";
import type { SiteSettings, Termin } from "./types";

const DAY_SORT = `select(
  dayOfWeek == "Ponedjeljak" => 0,
  dayOfWeek == "Utorak" => 1,
  dayOfWeek == "Srijeda" => 2,
  dayOfWeek == "Četvrtak" => 3,
  dayOfWeek == "Petak" => 4,
  dayOfWeek == "Subota" => 5,
  6
)`;

const TERMINI_QUERY = `*[_type == "termin" && (active == true || $includeInactive)] {
  _id,
  programName,
  dayOfWeek,
  specificDate,
  startTime,
  endTime,
  "trainerName": trainer->name,
  maxParticipants,
  spotsRemaining,
  status,
  note,
  colorTag,
  displayOrder,
  featured,
  active
} | order(${DAY_SORT} asc, startTime asc, displayOrder asc)`;

const SITE_SETTINGS_QUERY = `*[_type == "siteSettings"][0] {
  terminiSectionEnabled,
  showOnlyActiveTermini
}`;

/**
 * Fails soft (returns an empty list) instead of throwing when Sanity
 * hasn't been configured yet, or the request errors — the schedule
 * section simply renders nothing rather than breaking the build/page.
 */
export async function getTermini(includeInactive = false): Promise<Termin[]> {
  if (!sanityIsConfigured) return [];

  try {
    return await client.fetch<Termin[]>(
      TERMINI_QUERY,
      { includeInactive },
      { next: { tags: ["termini"], revalidate: 300 } },
    );
  } catch {
    return [];
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const fallback: SiteSettings = {
    terminiSectionEnabled: true,
    showOnlyActiveTermini: true,
  };

  if (!sanityIsConfigured) return fallback;

  try {
    const settings = await client.fetch<SiteSettings | null>(
      SITE_SETTINGS_QUERY,
      {},
      { next: { tags: ["siteSettings"], revalidate: 300 } },
    );
    return settings ?? fallback;
  } catch {
    return fallback;
  }
}
