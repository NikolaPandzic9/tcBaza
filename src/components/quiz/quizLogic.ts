import type { Localized, ProgramSlug } from "@/content/programs";

export type Goal = "rekreacija" | "sport" | "teretana" | "kik-boks";
export type AgeBracket = "under14" | "14-18" | "19plus";
export type Experience = "beginner" | "occasional" | "regular";

export interface QuizAnswers {
  goal: Goal | null;
  age: AgeBracket | null;
  experience: Experience | null;
}

export const INITIAL_ANSWERS: QuizAnswers = {
  goal: null,
  age: null,
  experience: null,
};

export type QuizStep = "goal" | "age" | "experience" | "result";

/** Which step comes next, given the current answers — drives the whole flow. */
export function getNextStep(answers: QuizAnswers): QuizStep {
  if (!answers.goal) return "goal";
  if (answers.goal === "teretana" || answers.goal === "kik-boks") return "result";
  if (!answers.age) return "age";
  if (!answers.experience) return "experience";
  return "result";
}

/** Full step list for the current branch — used to render accurate progress. */
export function getStepList(goal: Goal | null): QuizStep[] {
  if (goal === "teretana" || goal === "kik-boks") return ["goal", "result"];
  return ["goal", "age", "experience", "result"];
}

export interface QuizResultSpec {
  programSlug: ProgramSlug;
  /** null only for the honest sport/<14 fallback — no real pricing bracket exists. */
  tierId: string | null;
  reassurance: Localized;
}

const REASSURANCE: Record<Experience, Localized> = {
  beginner: {
    bs: "Nema iskustva? Nema problema — individualni plan se pravi tek nakon testiranja, bez obzira na to odakle kreneš.",
    en: "No experience? No problem — your individual plan is built only after testing, wherever you're starting from.",
  },
  occasional: {
    bs: "Povremeno treniraš? Testiranje pokazuje tačno gdje si sada, a plan gradi dalje od te tačke.",
    en: "Training occasionally? The assessment shows exactly where you stand now, and the plan builds from there.",
  },
  regular: {
    bs: "Redovno treniraš? Plan će biti prilagođen tvom nivou od prvog dana, uz stručni nadzor na svakom treningu.",
    en: "Training regularly? The plan will match your level from day one, with expert supervision every session.",
  },
};

const CONTACT_REASSURANCE: Localized = {
  bs: "Za sportiste mlađe od 14 godina program se dogovara individualno — javi nam se direktno.",
  en: "For athletes under 14, the program is arranged individually — get in touch with us directly.",
};

export function getQuizResult(answers: QuizAnswers): QuizResultSpec | null {
  const { goal, age, experience } = answers;
  if (!goal) return null;

  if (goal === "teretana") {
    return {
      programSlug: "komercijalna-teretana",
      tierId: "komercijalna-teretana",
      reassurance: {
        bs: "Bez grupnog rasporeda — dođeš kad tebi odgovara, u slobodnim terminima.",
        en: "No group schedule to follow — come whenever suits you, in the open slots.",
      },
    };
  }

  if (goal === "kik-boks") {
    return {
      programSlug: "kik-boks",
      tierId: "kik-boks",
      reassurance: {
        bs: "Treninzi se vode u saradnji sa Kik boks klubom Slavija — za trenera i cijenu nas kontaktiraj direktno.",
        en: "Sessions are run with Kik boks klub Slavija — contact us directly for the trainer and price.",
      },
    };
  }

  if (!age) return null;

  if (goal === "rekreacija") {
    return {
      programSlug: "rekreativci",
      tierId: age === "19plus" ? "rekreativci-18-plus" : "rekreativci-do-18",
      reassurance: experience ? REASSURANCE[experience] : REASSURANCE.beginner,
    };
  }

  // goal === "sport"
  if (age === "under14") {
    return {
      programSlug: "sportisti",
      tierId: null,
      reassurance: CONTACT_REASSURANCE,
    };
  }

  return {
    programSlug: "sportisti",
    tierId: age === "14-18" ? "sportisti-14-19" : "sportisti-19-plus",
    reassurance: experience ? REASSURANCE[experience] : REASSURANCE.regular,
  };
}
