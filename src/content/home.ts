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
