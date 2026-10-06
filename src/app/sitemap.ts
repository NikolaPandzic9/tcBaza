import type { MetadataRoute } from "next";
import { routing, type Pathnames } from "@/i18n/routing";
import { PROGRAM_HREFS } from "@/content/programs";
import { localizedUrl } from "@/lib/seo";
import { getSiteContent } from "@/server/site/content";

/**
 * Generated from routing.pathnames, so a renamed or added route can't be
 * forgotten here. Priority reflects how close a page is to a booking
 * decision; anything not listed defaults to 0.6.
 */
const PRIORITY: Partial<Record<Pathnames, number>> = {
  "/": 1.0,
  "/usluge": 0.9,
  "/rezervacija-termina": 0.9,
  "/usluge/rekreativci": 0.8,
  "/usluge/sportisti": 0.8,
  "/usluge/komercijalna-teretana": 0.8,
  "/usluge/sportski-pasos": 0.8,
  "/usluge/oporavak": 0.8,
  "/usluge/online-program": 0.7,
  "/clanarine-i-cijene": 0.8,
  "/rezervacija-termina/komercijalna-teretana": 0.7,
  "/kontakt": 0.7,
  "/o-nama": 0.7,
  "/partneri": 0.4,
  "/politika-privatnosti": 0.2,
  "/uslovi-koristenja": 0.2,
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Program pages hidden in the ERP return 404 — keep them out.
  const { programs } = await getSiteContent();
  const visible = new Set<Pathnames>(programs.map((p) => p.href));
  const hidden = new Set(Object.values(PROGRAM_HREFS).filter((href) => !visible.has(href)));
  const paths = (Object.keys(routing.pathnames) as Pathnames[]).filter((path) => !hidden.has(path));

  return paths.flatMap((path) => {
    const languages = {
      bs: localizedUrl(path, "bs"),
      en: localizedUrl(path, "en"),
      "x-default": localizedUrl(path, "bs"),
    };

    return routing.locales.map((locale) => ({
      url: languages[locale],
      changeFrequency: path.startsWith("/rezervacija-termina") ? "daily" : "monthly",
      priority: PRIORITY[path] ?? 0.6,
      alternates: { languages },
    }));
  });
}
