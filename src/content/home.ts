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
    bs: "Plan koji poznaje tvoje tijelo prije prvog treninga.",
    en: "A plan that knows your body before your first session.",
  } satisfies Localized,
  body: {
    bs: "Svaki novi član prolazi inicijalno testiranje — mjerenje snage, mobilnosti i eksplozivnosti — prije nego što dobije svoj plan. Tako trening ima smisla od prvog dana, umjesto da se prilagođava usput.",
    en: "Every new member goes through an initial assessment — strength, mobility, and power testing — before receiving their plan. That way training makes sense from day one, instead of being adjusted along the way.",
  } satisfies Localized,
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
    bs: "Prvi korak je testiranje. Drugi je tvoj plan.",
    en: "The first step is testing. The second is your plan.",
  } satisfies Localized,
  body: {
    bs: "Javi se i dogovori inicijalno testiranje — bez obaveze, bez pritiska.",
    en: "Get in touch and book your initial assessment — no obligation, no pressure.",
  } satisfies Localized,
};
