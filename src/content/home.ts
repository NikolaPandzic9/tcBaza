import { DEFAULT_CONTACT } from "@/lib/constants";
import type { FaqItem } from "./programDetails";
import type { Localized } from "./programs";

export const HERO = {
  eyebrow: { bs: "Istočno Sarajevo", en: "Istočno Sarajevo" } satisfies Localized,
  headline: {
    bs: "Grupni trening. Individualni rezultat.",
    en: "Group training. Individual results.",
  } satisfies Localized,
  body: {
    bs: "Male grupe do 5 članova, plan treninga izrađen nakon testiranja i stručan trener na svakom treningu — bez gužve, bez pogađanja.",
    en: "Small groups of up to 5 members, a training plan built after assessment, and a qualified trainer at every session — no crowding, no guesswork.",
  } satisfies Localized,
  primaryCta: { bs: "Pronađi svoj program", en: "Find your program" } satisfies Localized,
};

export const USP = {
  eyebrow: { bs: "Zašto Baza", en: "Why Baza" } satisfies Localized,
  headline: {
    bs: "Zašto Baza?",
    en: "Why Baza?",
  } satisfies Localized,
  reasons: [
    {
      title: {
        bs: "Grupni treninzi sa personalizovanim planom",
        en: "Group training with a personalized plan",
      },
      body: {
        bs: "Treniraš u maloj grupi (do 5 ljudi), ali ne radite svi iste vježbe. Svaki član dobija svoj individualni program napravljen na osnovu dijagnostike.",
        en: "You train in a small group (up to 5 people), but you don't all do the same exercises. Every member gets their own individual program built from real diagnostics.",
      },
    },
    {
      title: { bs: "Tim od 5 stručnjaka", en: "A team of 5 specialists" },
      body: {
        bs: "Naš tim čine posvećeni treneri koji prate svaki tvoj pokret, osiguravaju pravilnu izvedbu i vode te kroz tvoj lični napredak.",
        en: "Our team is made up of dedicated trainers who track your every move, keep your form correct, and guide you through your personal progress.",
      },
    },
    {
      title: { bs: "Precizna dijagnostika", en: "Precise diagnostics" },
      body: {
        bs: "Ne nagađamo, već mjerimo. Svaki proces počinje detaljnom procjenom mobilnosti, snage i motorike kako bismo kreirali program baš za tebe.",
        en: "We don't guess, we measure. Every process starts with a detailed assessment of mobility, strength, and motor skills so we can build a program made just for you.",
      },
    },
    {
      title: { bs: "Maksimalna posvećenost", en: "Maximum dedication" },
      body: {
        bs: "Spajamo energiju i motivaciju rada u grupi sa preciznošću i pažnjom personalnog treninga.",
        en: "We combine the energy and motivation of group training with the precision and attention of personal training.",
      },
    },
  ] satisfies { title: Localized; body: Localized }[],
};

export const SCHEDULE_TEASER = {
  eyebrow: { bs: "Raspored", en: "Schedule" } satisfies Localized,
  headline: {
    bs: "Dostupni termini",
    en: "Available sessions",
  } satisfies Localized,
  body: {
    bs: "Trenutni raspored grupnih treninga — mjesta su ograničena na 5 članova po grupi.",
    en: "The current group-training schedule — spots are capped at 5 members per group.",
  } satisfies Localized,
  emptyState: {
    bs: "Raspored termina se trenutno ažurira. Za dostupne termine pozovi nas direktno.",
    en: "The schedule is currently being updated. Call us directly for available sessions.",
  } satisfies Localized,
};

export const INSTAGRAM_TEASER = {
  eyebrow: { bs: "Instagram", en: "Instagram" } satisfies Localized,
  headline: {
    bs: "Prati nas na terenu",
    en: "Follow us on the floor",
  } satisfies Localized,
  body: {
    bs: "Treninzi, testiranja i svakodnevni rad u Bazi — objavljujemo na Instagramu.",
    en: "Training sessions, assessments, and everyday work at Baza — we post it all on Instagram.",
  } satisfies Localized,
  cta: { bs: "Otvori @tc.baza", en: "Open @tc.baza" } satisfies Localized,
};

export const FINAL_CTA = {
  headline: {
    bs: "Izgradi svoju Bazu. Napravi promjenu — zbog sebe.",
    en: "Build your Baza. Make a change — for yourself.",
  } satisfies Localized,
  body: {
    bs: "Javi se i dogovori inicijalno testiranje — bez obaveze, bez pritiska.",
    en: "Get in touch and book your initial assessment — no obligation, no pressure.",
  } satisfies Localized,
};

export const LOCATION = {
  eyebrow: { bs: "Lokacija", en: "Location" } satisfies Localized,
  headline: { bs: "Gdje se nalazimo", en: "Where to find us" } satisfies Localized,
  serviceArea: {
    bs: "Na usluzi smo svima iz Istočnog Sarajeva — Lukavice, Istočne Ilidže i Istočnog Novog Sarajeva — kao i iz Sarajeva, Pala i okoline.",
    en: "We welcome everyone from Istočno Sarajevo — Lukavica, Istočna Ilidža, and Istočno Novo Sarajevo — as well as Sarajevo, Pale, and the surrounding area.",
  } satisfies Localized,
  hoursLabel: { bs: "Svaki dan", en: "Every day" } satisfies Localized,
};

/** General questions for the home page. Every answer restates facts
 * published elsewhere on the site (prices, hours, group size, address). */
export const DEFAULT_HOME_FAQ: FaqItem[] = [
  {
    question: {
      bs: "Gdje se nalazi Trening centar Baza?",
      en: "Where is Trening centar Baza?",
    },
    answer: {
      bs: `Na adresi ${DEFAULT_CONTACT.street}, ${DEFAULT_CONTACT.city}. Na usluzi smo svima iz Istočnog Sarajeva, Lukavice, Sarajeva, Pala i okoline.`,
      en: `At ${DEFAULT_CONTACT.street}, ${DEFAULT_CONTACT.city}. We welcome everyone from Istočno Sarajevo, Lukavica, Sarajevo, Pale, and the surrounding area.`,
    },
  },
  {
    question: { bs: "Kakvo je radno vrijeme?", en: "What are your opening hours?" },
    answer: {
      bs: `Otvoreni smo svaki dan od ${DEFAULT_CONTACT.hours.opens} do ${DEFAULT_CONTACT.hours.closes}.`,
      en: `We're open every day from ${DEFAULT_CONTACT.hours.opens} to ${DEFAULT_CONTACT.hours.closes}.`,
    },
  },
  {
    question: {
      bs: "Koliko košta trening i članarina?",
      en: "How much do training and membership cost?",
    },
    answer: {
      bs: "Grupni treninzi za rekreativce i sportiste koštaju od 150 KM mjesečno, članarina za teretanu 50 KM, Sportski pasoš za djecu 80 KM mjesečno, a usluge oporavka od 15 KM.",
      en: "Group training for recreational members and athletes starts at 150 KM per month, open gym membership is 50 KM, the Sports Passport kids program is 80 KM per month, and recovery services start at 15 KM.",
    },
  },
  {
    question: {
      bs: "Koliko ljudi trenira u jednoj grupi?",
      en: "How many people train in one group?",
    },
    answer: {
      bs: "Najviše 5 članova, uz stručnog trenera na svakom treningu. Svaki član ima individualni plan napravljen nakon inicijalnog testiranja.",
      en: "Up to 5 members, with a qualified trainer at every session. Every member has an individual plan built after an initial assessment.",
    },
  },
  {
    question: { bs: "Imate li program za djecu?", en: "Do you have a program for kids?" },
    answer: {
      bs: "Da — Sportski pasoš. Kroz igru i raznovrsne sportske aktivnosti djeca razvijaju motoriku, snagu, brzinu i koordinaciju, a svaki mjesec upoznaju novu sportsku disciplinu. Cijena je 80 KM mjesečno, broj mjesta je ograničen.",
      en: "Yes — Sports Passport. Through play and a variety of sports, kids build motor skills, strength, speed, and coordination, and discover a new sport every month. It costs 80 KM per month, and places are limited.",
    },
  },
  {
    question: {
      bs: "Kako da zakažem prvi trening?",
      en: "How do I book my first session?",
    },
    answer: {
      bs: `Pozovi ${DEFAULT_CONTACT.phone} ili nam piši na WhatsApp ili Instagram (${DEFAULT_CONTACT.instagramHandle}). Prvi korak je inicijalno testiranje — bez obaveze, bez pritiska.`,
      en: `Call ${DEFAULT_CONTACT.phone} or message us on WhatsApp or Instagram (${DEFAULT_CONTACT.instagramHandle}). The first step is an initial assessment — no obligation, no pressure.`,
    },
  },
];
