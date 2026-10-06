import type { Pathnames } from "@/i18n/routing";

export const PROGRAM_SLUGS = [
  "rekreativci",
  "sportisti",
  "komercijalna-teretana",
  "sportski-pasos",
  "online-program",
] as const;

export type ProgramSlug = (typeof PROGRAM_SLUGS)[number];

/** Each program has its own page (fixed route) — the ERP edits the
 * content, the URL stays here. */
export const PROGRAM_HREFS: Record<ProgramSlug, Pathnames> = {
  rekreativci: "/usluge/rekreativci",
  sportisti: "/usluge/sportisti",
  "komercijalna-teretana": "/usluge/komercijalna-teretana",
  "sportski-pasos": "/usluge/sportski-pasos",
  "online-program": "/usluge/online-program",
};

export function isProgramSlug(value: string): value is ProgramSlug {
  return (PROGRAM_SLUGS as readonly string[]).includes(value);
}

export interface Localized {
  bs: string;
  en: string;
}

export interface PricingTier {
  id: string;
  label: Localized;
  /** null = price not published — never render a placeholder number. */
  price: { amount: number; period: Localized } | null;
  sessionsPerWeek: number | null;
}

export interface Program {
  slug: ProgramSlug;
  href: Pathnames;
  name: Localized;
  shortPitch: Localized;
  tiers: PricingTier[];
}

export const MONTHLY_PERIOD: Localized = { bs: "KM/mjesečno", en: "KM/month" };

export const DEFAULT_PROGRAMS: Program[] = [
  {
    slug: "rekreativci",
    href: "/usluge/rekreativci",
    name: { bs: "Rekreativci", en: "Recreational" },
    shortPitch: {
      bs: "Grupni trening za svakoga ko želi biti u formi — bez obzira na godine ili predznanje.",
      en: "Group training for anyone who wants to get in shape — no matter their age or experience.",
    },
    tiers: [
      {
        id: "rekreativci-do-18",
        label: { bs: "Do 18 godina", en: "Under 18" },
        price: { amount: 150, period: MONTHLY_PERIOD },
        sessionsPerWeek: 3,
      },
      {
        id: "rekreativci-18-plus",
        label: { bs: "18+", en: "18+" },
        price: { amount: 200, period: MONTHLY_PERIOD },
        sessionsPerWeek: 3,
      },
    ],
  },
  {
    slug: "sportisti",
    href: "/usluge/sportisti",
    name: { bs: "Sportisti", en: "Athletes" },
    shortPitch: {
      bs: "Priprema za takmičarski sport, uz individualni plan izrađen nakon inicijalnog testiranja.",
      en: "Competitive-sport preparation, with an individual plan built after an initial assessment.",
    },
    tiers: [
      {
        id: "sportisti-14-19",
        label: { bs: "14–19 godina", en: "14–19 years" },
        price: { amount: 150, period: MONTHLY_PERIOD },
        sessionsPerWeek: null,
      },
      {
        id: "sportisti-19-plus",
        label: { bs: "19+", en: "19+" },
        price: { amount: 200, period: MONTHLY_PERIOD },
        sessionsPerWeek: null,
      },
    ],
  },
  {
    slug: "komercijalna-teretana",
    href: "/usluge/komercijalna-teretana",
    name: { bs: "Komercijalna teretana", en: "Open Gym Access" },
    shortPitch: {
      bs: "Samostalan trening u terminima kad teretana nije zauzeta grupnim treninzima.",
      en: "Independent training in the time slots not booked by group sessions.",
    },
    tiers: [
      {
        id: "komercijalna-teretana",
        label: { bs: "Mjesečna članarina", en: "Monthly membership" },
        price: { amount: 50, period: MONTHLY_PERIOD },
        sessionsPerWeek: null,
      },
    ],
  },
  {
    slug: "sportski-pasos",
    href: "/usluge/sportski-pasos",
    name: { bs: "Sportski pasoš", en: "Sports Passport" },
    shortPitch: {
      bs: "Sportski program za djecu: kroz igru, stručan rad i raznovrsne sportske aktivnosti razvijaju motoriku, snagu, brzinu i koordinaciju.",
      en: "A sports program for kids: through play, expert coaching, and a variety of sports, they build motor skills, strength, speed, and coordination.",
    },
    tiers: [
      {
        id: "sportski-pasos",
        label: { bs: "Mjesečna članarina", en: "Monthly membership" },
        price: { amount: 80, period: MONTHLY_PERIOD },
        sessionsPerWeek: null,
      },
    ],
  },
  {
    slug: "online-program",
    href: "/usluge/online-program",
    name: { bs: "Online program", en: "Online program" },
    shortPitch: {
      bs: "Trening plan i praćenje napretka na daljinu, za sve koji ne mogu redovno u prostor Baze.",
      en: "A training plan and progress tracking, remotely — for anyone who can't make it to the Baza space regularly.",
    },
    tiers: [
      {
        id: "online-program",
        label: { bs: "Mjesečni program", en: "Monthly program" },
        // Not published by the client yet — never invent a figure here.
        price: null,
        sessionsPerWeek: null,
      },
    ],
  },
];

export function findProgram(programs: Program[], slug: ProgramSlug): Program | undefined {
  return programs.find((p) => p.slug === slug);
}

/** "od 150 KM/mjesečno", or a contact prompt when no tier has a published price. */
export function getStartingPriceLabel(
  program: Program,
  locale: "bs" | "en",
): string {
  const priced = program.tiers.filter(
    (tier): tier is PricingTier & { price: NonNullable<PricingTier["price"]> } =>
      tier.price !== null,
  );

  if (priced.length === 0) {
    return locale === "bs" ? "Cijena na upit" : "Price on request";
  }

  const cheapest = priced.reduce((min, tier) =>
    tier.price.amount < min.price.amount ? tier : min,
  );

  const from = locale === "bs" ? "od" : "from";
  return `${from} ${cheapest.price.amount} ${cheapest.price.period[locale]}`;
}
