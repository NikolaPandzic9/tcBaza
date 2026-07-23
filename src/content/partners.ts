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

// Kik boks klub Slavija's logo hasn't been supplied yet — see
// HANDOVER.md: requesting it is a pre-launch follow-up.
export const PARTNERS: Partner[] = [
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
    name: "Kik boks klub Slavija",
    category: { bs: "Sportski partner", en: "Sports partner" },
    description: {
      bs: "U saradnji sa Bazom organizuje treninge kik boksa, tri puta sedmično.",
      en: "Runs kickboxing sessions in partnership with Baza, three times a week.",
    },
    logo: null,
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
