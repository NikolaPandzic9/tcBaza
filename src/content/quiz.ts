import type { Localized } from "./programs";
import type { AgeBracket, Experience, Goal } from "@/components/quiz/quizLogic";

export const QUIZ_INTRO = {
  eyebrow: { bs: "Pronađi svoj program", en: "Find your program" } satisfies Localized,
  headline: {
    bs: "Koji program je za mene?",
    en: "Which program is right for me?",
  } satisfies Localized,
  body: {
    bs: "Tri kratka pitanja, tačan odgovor — program, cijena i sljedeći korak.",
    en: "Three short questions, a precise answer — program, price, and the next step.",
  } satisfies Localized,
};

export interface QuizOption<T extends string> {
  value: T;
  label: Localized;
}

export const GOAL_QUESTION = {
  text: {
    bs: "Šta ti je trenutno najvažnije?",
    en: "What matters most to you right now?",
  } satisfies Localized,
  options: [
    {
      value: "rekreacija",
      label: {
        bs: "Bolja forma i osjećam se jače",
        en: "Better shape and feeling stronger",
      },
    },
    {
      value: "sport",
      label: {
        bs: "Napredak u sportu / priprema za takmičenje",
        en: "Progress in sport / competition prep",
      },
    },
    {
      value: "teretana",
      label: {
        bs: "Samo mi treba pristup teretani, bez grupnog treninga",
        en: "I just need gym access, no group training",
      },
    },
    {
      value: "kik-boks",
      label: { bs: "Zanima me kik boks", en: "I'm interested in kickboxing" },
    },
  ] satisfies QuizOption<Goal>[],
};

export const AGE_QUESTION = {
  text: { bs: "Koliko imaš godina?", en: "How old are you?" } satisfies Localized,
  options: [
    { value: "under14", label: { bs: "Manje od 14", en: "Under 14" } },
    { value: "14-18", label: { bs: "14–18", en: "14–18" } },
    { value: "19plus", label: { bs: "19+", en: "19+" } },
  ] satisfies QuizOption<AgeBracket>[],
};

export const EXPERIENCE_QUESTION = {
  text: {
    bs: "Kakvo je tvoje dosadašnje iskustvo?",
    en: "What's your experience so far?",
  } satisfies Localized,
  options: [
    { value: "beginner", label: { bs: "Početnik", en: "Beginner" } },
    { value: "occasional", label: { bs: "Povremeno treniram", en: "Train occasionally" } },
    { value: "regular", label: { bs: "Redovno treniram", en: "Train regularly" } },
  ] satisfies QuizOption<Experience>[],
};
