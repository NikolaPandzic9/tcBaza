import { defineRouting } from "next-intl/routing";

/**
 * Canonical (bs) slugs are the source of truth for the app/ folder structure.
 * The `pathnames` map lets next-intl rewrite them to real English URLs
 * (e.g. /en/about) without duplicating the folder tree per locale.
 */
export const routing = defineRouting({
  locales: ["bs", "en"],
  defaultLocale: "bs",
  localePrefix: "as-needed",
  // The primary market (Istočno Sarajevo) is entirely local — a Bosnian
  // visitor on an English-configured browser/OS (common) should still
  // land on the bs site by default, not get redirected on Accept-Language
  // alone. Manual switching via the header toggle is unaffected.
  localeDetection: false,
  pathnames: {
    "/": "/",
    "/o-nama": { bs: "/o-nama", en: "/about" },
    "/usluge": { bs: "/usluge", en: "/services" },
    "/usluge/rekreativci": {
      bs: "/usluge/rekreativci",
      en: "/services/recreational",
    },
    "/usluge/sportisti": {
      bs: "/usluge/sportisti",
      en: "/services/athletes",
    },
    "/usluge/komercijalna-teretana": {
      bs: "/usluge/komercijalna-teretana",
      en: "/services/commercial-gym",
    },
    "/usluge/kik-boks": {
      bs: "/usluge/kik-boks",
      en: "/services/kickboxing",
    },
    "/usluge/online-program": {
      bs: "/usluge/online-program",
      en: "/services/online-program",
    },
    "/usluge/oporavak": {
      bs: "/usluge/oporavak",
      en: "/services/recovery",
    },
    "/clanarine-i-cijene": { bs: "/clanarine-i-cijene", en: "/pricing" },
    "/nas-tim": { bs: "/nas-tim", en: "/team" },
    "/kontakt": { bs: "/kontakt", en: "/contact" },
    "/rezervacija-termina": {
      bs: "/rezervacija-termina",
      en: "/schedule",
    },
    "/rezervacija-termina/komercijalna-teretana": {
      bs: "/rezervacija-termina/komercijalna-teretana",
      en: "/schedule/commercial-gym",
    },
    "/partneri": { bs: "/partneri", en: "/partners" },
    "/politika-privatnosti": {
      bs: "/politika-privatnosti",
      en: "/privacy-policy",
    },
    "/uslovi-koristenja": {
      bs: "/uslovi-koristenja",
      en: "/terms-of-use",
    },
  },
});

export type Locale = (typeof routing.locales)[number];
export type Pathnames = keyof typeof routing.pathnames;
