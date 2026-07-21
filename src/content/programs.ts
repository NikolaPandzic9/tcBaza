import type { Pathnames } from "@/i18n/routing";

export type ProgramSlug =
  | "rekreativci"
  | "sportisti"
  | "komercijalna-teretana"
  | "kik-boks";

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

const MONTHLY_PERIOD: Localized = { bs: "KM/mjesečno", en: "KM/month" };

export const PROGRAMS: Program[] = [
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
    slug: "kik-boks",
    href: "/usluge/kik-boks",
    name: { bs: "Kik boks", en: "Kickboxing" },
    shortPitch: {
      bs: "Treninzi kik boksa u saradnji sa Kik boks klubom Slavija, od septembra.",
      en: "Kickboxing sessions run in partnership with Kik boks klub Slavija, starting in September.",
    },
    tiers: [
      {
        id: "kik-boks",
        label: {
          bs: "Ponedjeljak, srijeda, petak — 18:00–19:30",
          en: "Monday, Wednesday, Friday — 6:00–7:30 PM",
        },
        // Not published by the client — never invent a figure here.
        price: null,
        sessionsPerWeek: 3,
      },
    ],
  },
];

export function getProgram(slug: ProgramSlug): Program {
  const program = PROGRAMS.find((p) => p.slug === slug);
  if (!program) throw new Error(`Unknown program slug: ${slug}`);
  return program;
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
