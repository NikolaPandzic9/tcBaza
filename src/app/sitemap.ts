import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

/** Canonical (bs) path paired with its localized English path. */
const ROUTES: { bs: string; en: string; priority: number }[] = [
  { bs: "/", en: "/en", priority: 1.0 },
  { bs: "/o-nama", en: "/en/about", priority: 0.8 },
  { bs: "/usluge", en: "/en/services", priority: 0.9 },
  { bs: "/usluge/rekreativci", en: "/en/services/recreational", priority: 0.8 },
  { bs: "/usluge/sportisti", en: "/en/services/athletes", priority: 0.8 },
  {
    bs: "/usluge/komercijalna-teretana",
    en: "/en/services/commercial-gym",
    priority: 0.8,
  },
  { bs: "/usluge/kik-boks", en: "/en/services/kickboxing", priority: 0.8 },
  { bs: "/usluge/oporavak", en: "/en/services/recovery", priority: 0.8 },
  {
    bs: "/usluge/online-program",
    en: "/en/services/online-program",
    priority: 0.8,
  },
  { bs: "/clanarine-i-cijene", en: "/en/pricing", priority: 0.8 },
  { bs: "/nas-tim", en: "/en/team", priority: 0.6 },
  { bs: "/kontakt", en: "/en/contact", priority: 0.7 },
  { bs: "/rezervacija-termina", en: "/en/schedule", priority: 0.9 },
  {
    bs: "/rezervacija-termina/komercijalna-teretana",
    en: "/en/schedule/commercial-gym",
    priority: 0.8,
  },
  { bs: "/partneri", en: "/en/partners", priority: 0.4 },
  { bs: "/politika-privatnosti", en: "/en/privacy-policy", priority: 0.2 },
  { bs: "/uslovi-koristenja", en: "/en/terms-of-use", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const route of ROUTES) {
    const languages = { bs: `${SITE_URL}${route.bs}`, en: `${SITE_URL}${route.en}` };

    entries.push({
      url: `${SITE_URL}${route.bs}`,
      priority: route.priority,
      alternates: { languages: { ...languages, "x-default": languages.bs } },
    });
    entries.push({
      url: `${SITE_URL}${route.en}`,
      priority: route.priority,
      alternates: { languages: { ...languages, "x-default": languages.bs } },
    });
  }

  return entries;
}
