import type { Localized } from "./programs";

export interface Partner {
  name: string;
  description: Localized;
}

// No partner logos were supplied — text-based cards for now (see
// HANDOVER.md: requesting logos is a pre-launch follow-up).
export const PARTNERS: Partner[] = [
  {
    name: "KMF Tango",
    description: {
      bs: "Partner Trening centra Baza.",
      en: "Partner of Trening centar Baza.",
    },
  },
  {
    name: "Kik boks klub Slavija",
    description: {
      bs: "U saradnji sa Bazom organizuje treninge kik boksa, tri puta sedmično.",
      en: "Runs kickboxing sessions in partnership with Baza, three times a week.",
    },
  },
];
