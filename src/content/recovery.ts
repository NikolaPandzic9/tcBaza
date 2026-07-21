import type { Localized } from "./programs";

export const RECOVERY_INTRO = {
  eyebrow: { bs: "Oporavak", en: "Recovery" } satisfies Localized,
  headline: {
    bs: "Trening je pola priče. Oporavak je druga.",
    en: "Training is half the story. Recovery is the other half.",
  } satisfies Localized,
  body: {
    bs: "Masaža, hladna kupka i kompresivne čizme — dostupni pojedinačno ili kao dio članarine, po povoljnijoj cijeni za članove Baze.",
    en: "Massage, cold plunge, and compression boots — available individually or as part of membership, at a lower price for Baza members.",
  } satisfies Localized,
};

interface PriceLine {
  label: Localized;
  amount: number;
}

export interface RecoveryService {
  slug: "masaza" | "hladna-kupka" | "kompresivne-cizme" | "kombinovani-paket";
  name: Localized;
  duration: Localized | null;
  prices: PriceLine[];
  benefits: Localized[];
}

export const RECOVERY_SERVICES: RecoveryService[] = [
  {
    slug: "masaza",
    name: { bs: "Masaža", en: "Massage" },
    duration: { bs: "40 minuta", en: "40 minutes" },
    prices: [
      { label: { bs: "Redovna cijena", en: "Regular price" }, amount: 40 },
      { label: { bs: "Za članove", en: "For members" }, amount: 30 },
      { label: { bs: "Paket 3+1", en: "3+1 package" }, amount: 120 },
      { label: { bs: "Paket 3+1, za članove", en: "3+1 package, for members" }, amount: 100 },
    ],
    benefits: [],
  },
  {
    slug: "hladna-kupka",
    name: { bs: "Hladna kupka", en: "Cold plunge" },
    duration: null,
    prices: [
      { label: { bs: "Po terminu", en: "Per session" }, amount: 15 },
      {
        label: {
          bs: "Neograničeno za članove (doplata na članarinu)",
          en: "Unlimited for members (add-on to membership)",
        },
        amount: 50,
      },
    ],
    benefits: [
      { bs: "Smanjenje upale mišića", en: "Reduced muscle inflammation" },
      { bs: "Brža regeneracija", en: "Faster regeneration" },
      { bs: "Oporavak nervnog sistema", en: "Nervous system recovery" },
      { bs: "Povećanje nivoa dopamina", en: "Increased dopamine levels" },
      {
        bs: "Brže uklanjanje metabolita iz mišića",
        en: "Faster clearance of metabolites from muscles",
      },
    ],
  },
  {
    slug: "kompresivne-cizme",
    name: { bs: "Kompresivne čizme", en: "Compression boots" },
    duration: { bs: "20–30 minuta", en: "20–30 minutes" },
    prices: [
      { label: { bs: "Redovna cijena", en: "Regular price" }, amount: 30 },
      { label: { bs: "Za članove", en: "For members" }, amount: 20 },
      { label: { bs: "Mjesečni paket", en: "Monthly package" }, amount: 100 },
      { label: { bs: "Mjesečni paket, za članove", en: "Monthly package, for members" }, amount: 80 },
    ],
    benefits: [
      { bs: "Limfna drenaža", en: "Lymphatic drainage" },
      { bs: "Brži oporavak", en: "Faster recovery" },
      { bs: "Smanjenje otoka", en: "Reduced swelling" },
      { bs: "Veći opseg pokreta", en: "Greater range of motion" },
    ],
  },
  {
    slug: "kombinovani-paket",
    name: {
      bs: "Kombinovani paket (čizme + hladna kupka)",
      en: "Combined package (boots + cold plunge)",
    },
    duration: null,
    prices: [
      { label: { bs: "Redovna cijena", en: "Regular price" }, amount: 40 },
      { label: { bs: "Za članove", en: "For members" }, amount: 30 },
    ],
    benefits: [],
  },
];
