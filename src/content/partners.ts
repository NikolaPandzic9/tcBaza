import type { Localized } from "./programs";

export interface Partner {
  name: string;
  category: Localized;
  description: Localized;
  /** null where no real client-supplied logo exists — card falls back
   * to a generic icon instead of inventing a mark. */
  logo: string | null;
  url?: string;
}

export const DEFAULT_PARTNERS: Partner[] = [
  {
    name: "KMF Tango",
    category: { bs: "Sportski partner", en: "Sports partner" },
    description: {
      bs: "Partner Trening centra Baza.",
      en: "Partner of Trening centar Baza.",
    },
    logo: "/brand/partner-kmf-tango.jpg",
  },
  {
    name: "Studio Devet",
    category: { bs: "Tehnološka podrška", en: "Technology partner" },
    description: {
      bs: "Digitalni studio koji je dizajnirao i razvio sajt Trening centra Baza.",
      en: "The digital studio that designed and built Trening centar Baza's website.",
    },
    logo: "/brand/logo-devet-navy.svg",
    url: "https://devet.ba",
  },
];
