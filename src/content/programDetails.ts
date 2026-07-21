import type { Localized, ProgramSlug } from "./programs";

export interface ProgramDetail {
  longDescription: Localized;
  features: Localized[];
  /** null where no real client photo exists — subpage falls back to a
   * typography/motif treatment instead of a photo. */
  image: { src: string; alt: Localized } | null;
}

export const PROGRAM_DETAILS: Record<ProgramSlug, ProgramDetail> = {
  rekreativci: {
    longDescription: {
      bs: "Program za sve koji žele trenirati ozbiljno, ali bez pritiska takmičarskog sporta. Svaki član prolazi inicijalno testiranje, dobija individualni plan i trenira u grupi od maksimalno 5 ljudi — dovoljno malo da trener prati svakoga, dovoljno veliko da trening bude dinamičan.",
      en: "A program for anyone who wants to train seriously, without the pressure of competitive sport. Every member goes through an initial assessment, gets an individual plan, and trains in a group of up to 5 people — small enough for the trainer to watch everyone, big enough to keep training dynamic.",
    },
    features: [
      { bs: "Personalizovani grupni treninzi", en: "Personalized group training" },
      { bs: "Maksimalno 5 članova u grupi", en: "Maximum 5 members per group" },
      {
        bs: "Individualni plan nakon inicijalnog testiranja",
        en: "Individual plan after an initial assessment",
      },
      {
        bs: "Stručni trener na svakom treningu",
        en: "A qualified trainer at every session",
      },
      { bs: "Kontinuirano praćenje napretka", en: "Continuous progress tracking" },
    ],
    image: {
      src: "/photos/strength-training-1.jpg",
      alt: {
        bs: "Grupni trening snage u Bazi",
        en: "Group strength training at Baza",
      },
    },
  },
  sportisti: {
    longDescription: {
      bs: "Priprema za takmičarski sport gradi se na istom principu — testiranje prije plana. Za sportiste to znači plan koji cilja na eksplozivnost, snagu i sprečavanje povreda specifično za njihov sport, uz kontinuirano praćenje napretka kroz sezonu.",
      en: "Preparation for competitive sport is built on the same principle — testing before the plan. For athletes, that means a plan targeting power, strength, and injury prevention specific to their sport, with progress tracked continuously through the season.",
    },
    features: [
      {
        bs: "Individualni plan nakon inicijalnog testiranja",
        en: "Individual plan after an initial assessment",
      },
      {
        bs: "Fokus na eksplozivnost, snagu i prevenciju povreda",
        en: "Focus on power, strength, and injury prevention",
      },
      { bs: "Stručni trener na svakom treningu", en: "A qualified trainer at every session" },
      {
        bs: "Praćenje sportskog napretka kroz sezonu",
        en: "Athletic progress tracked through the season",
      },
    ],
    image: {
      src: "/photos/testing-jump-assessment.jpg",
      alt: {
        bs: "Testiranje eksplozivnosti sportiste u Bazi",
        en: "Athlete power assessment at Baza",
      },
    },
  },
  "komercijalna-teretana": {
    longDescription: {
      bs: "Za one kojima ne treba grupni raspored, ali žele pristup opremljenoj teretani — članarina pokriva samostalan trening u terminima koji nisu zauzeti grupnim treninzima.",
      en: "For those who don't need a group schedule but want access to a fully equipped gym — the membership covers independent training in the time slots not booked by group sessions.",
    },
    features: [
      { bs: "Samostalan pristup opremi", en: "Independent access to equipment" },
      {
        bs: "Termini van rasporeda grupnih treninga",
        en: "Slots outside the group-training schedule",
      },
      { bs: "Bez obaveznog rasporeda", en: "No fixed schedule to follow" },
    ],
    image: {
      src: "/photos/strength-training-2.jpg",
      alt: {
        bs: "Teretana u Bazi, oprema za samostalan trening",
        en: "The gym floor at Baza, equipment for independent training",
      },
    },
  },
  "kik-boks": {
    longDescription: {
      bs: "Od septembra, Trening centar Baza organizuje treninge kik boksa u saradnji sa Kik boks klubom Slavija — u prostoru Baze, tri puta sedmično. Za informacije o treneru i cijeni kontaktiraj nas direktno.",
      en: "Starting in September, Trening centar Baza runs kickboxing sessions in partnership with Kik boks klub Slavija — at the Baza space, three times a week. For trainer and pricing details, contact us directly.",
    },
    features: [
      {
        bs: "U saradnji sa Kik boks klubom Slavija",
        en: "Run in partnership with Kik boks klub Slavija",
      },
      {
        bs: "Ponedjeljak, srijeda, petak — 18:00–19:30",
        en: "Monday, Wednesday, Friday — 6:00–7:30 PM",
      },
    ],
    // Stock photo (no real client photo exists for kickboxing) — see
    // HANDOVER.md for the source/photographer to swap this out later.
    image: {
      src: "/photos/stock/kickboxing.jpg",
      alt: {
        bs: "Trening kik boksa uz pedove i rukavice",
        en: "Kickboxing pad training session",
      },
    },
  },
};
