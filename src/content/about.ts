import type { Localized } from "./programs";

export const ABOUT_HERO = {
  eyebrow: { bs: "O nama", en: "About us" } satisfies Localized,
  headline: {
    bs: "Dobrodošli u Baza Trening Centar",
    en: "Welcome to Baza Training Center",
  } satisfies Localized,
  tagline: {
    bs: "Investiraj u svoju snagu, zdravlje i pokret — zbog sebe.",
    en: "Invest in your strength, health, and movement — for yourself.",
  } satisfies Localized,
};

export const ABOUT_INTRO: Localized[] = [
  {
    bs: "U Bazi ne vjerujemo u improvizaciju, površne pristupe i šablonske treninge u kojima si samo broj. Stvorili smo prostor u kom treniraš u maloj grupi, ali potpuno po svom planu i programu, prilagođenom tvojim ciljevima i mogućnostima.",
    en: "At Baza, we don't believe in improvisation, superficial approaches, or cookie-cutter workouts where you're just a number. We've built a space where you train in a small group, but entirely on your own plan and program, tailored to your goals and abilities.",
  },
  {
    bs: "Bilo da si profesionalni sportista koji traži veću eksplozivnost, ili rekreativac koji želi tijelo bez bola, pune snage i energije — radimo pametno, vođeno i zbog sebe.",
    en: "Whether you're a competitive athlete chasing more explosive power, or you're training for yourself and want a body free of pain, full of strength and energy — we work smart, guided, and for yourself.",
  },
];

export const ABOUT_CHARACTERISTICS: Localized[] = [
  {
    bs: "Personalizovani grupni treninzi",
    en: "Personalized group training",
  },
  { bs: "Maksimalno 5 članova u grupi", en: "Maximum 5 members per group" },
  { bs: "Individualni plan treninga", en: "Individual training plan" },
  { bs: "Inicijalno testiranje", en: "Initial assessment" },
  {
    bs: "Stručni trener na svakom treningu",
    en: "A qualified trainer at every session",
  },
  {
    bs: "Kontinuirano praćenje napretka",
    en: "Continuous progress tracking",
  },
  { bs: "Individualan pristup svakom članu", en: "Individual attention for every member" },
  { bs: "Bez gužve i čekanja", en: "No crowding, no waiting" },
];

export const ABOUT_APPROACH = {
  eyebrow: { bs: "Naš pristup", en: "Our approach" } satisfies Localized,
  headline: {
    bs: "Testiranje nije formalnost — to je početna tačka.",
    en: "Testing isn't a formality — it's the starting point.",
  } satisfies Localized,
  body: {
    bs: "Svaki plan počinje mjerenjem, ne pretpostavkom. Trener prati napredak sa treninga na trening, prilagođava opterećenje kad je potrebno i drži tehniku pod kontrolom dok grupa raste u snazi zajedno. Zato je grupa ograničena na 5 članova — dovoljno malo da niko ne prođe nezapaženo.",
    en: "Every plan starts with measurement, not a guess. The trainer tracks progress from session to session, adjusts load when needed, and keeps technique in check as the group gets stronger together. That's why the group is capped at 5 members — small enough that no one trains unnoticed.",
  } satisfies Localized,
};

export const HOW_IT_WORKS = {
  eyebrow: { bs: "Kako radimo", en: "How it works" } satisfies Localized,
  headline: {
    bs: "Tri koraka do prvog treninga",
    en: "Three steps to your first session",
  } satisfies Localized,
  steps: [
    {
      title: { bs: "Inicijalno testiranje", en: "Initial assessment" },
      body: {
        bs: "Mjerimo snagu, mobilnost i eksplozivnost prije nego što napravimo bilo kakav plan.",
        en: "We measure strength, mobility, and power before building any plan at all.",
      },
    },
    {
      title: { bs: "Individualni plan", en: "Individual plan" },
      body: {
        bs: "Plan se pravi za tebe, na osnovu rezultata testiranja — ne generički šablon za sve.",
        en: "The plan is built for you, based on the assessment results — not a generic template.",
      },
    },
    {
      title: { bs: "Grupni trening, uz nadzor", en: "Group training, supervised" },
      body: {
        bs: "Treniraš u grupi do 5 članova, uz stručnog trenera na svakom treningu i praćenje napretka.",
        en: "You train in a group of up to 5, with a qualified trainer at every session and progress tracking.",
      },
    },
  ] satisfies { title: Localized; body: Localized }[],
};
