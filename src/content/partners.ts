import type { Localized } from "./programs";

export interface Partner {
  name: string;
  description: Localized;
  /** null where no real client-supplied logo exists — card falls back
   * to a generic icon instead of inventing a mark. */
  logo: string | null;
}

// Kik boks klub Slavija's logo hasn't been supplied yet — see
// HANDOVER.md: requesting it is a pre-launch follow-up.
export const PARTNERS: Partner[] = [
  {
    name: "KMF Tango",
    description: {
      bs: "Partner Trening centra Baza.",
      en: "Partner of Trening centar Baza.",
    },
    logo: "/brand/partner-kmf-tango.png",
  },
  {
    name: "Kik boks klub Slavija",
    description: {
      bs: "U saradnji sa Bazom organizuje treninge kik boksa, tri puta sedmično.",
      en: "Runs kickboxing sessions in partnership with Baza, three times a week.",
    },
    logo: null,
  },
];
