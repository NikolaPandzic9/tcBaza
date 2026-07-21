"use client";

import { AnimatePresence } from "motion/react";
import { useLocale } from "next-intl";
import { useState } from "react";
import type { Locale } from "@/i18n/routing";
import { AGE_QUESTION, EXPERIENCE_QUESTION, GOAL_QUESTION, QUIZ_INTRO } from "@/content/quiz";
import { Container } from "@/components/ui/Container";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { QuizProgressBar } from "./QuizProgressBar";
import { QuizQuestion } from "./QuizQuestion";
import { QuizResultCard } from "./QuizResultCard";
import {
  INITIAL_ANSWERS,
  getNextStep,
  getQuizResult,
  getStepList,
  type QuizAnswers,
} from "./quizLogic";

export function ProgramQuiz() {
  const locale = useLocale() as Locale;
  const [answers, setAnswers] = useState<QuizAnswers>(INITIAL_ANSWERS);

  const step = getNextStep(answers);
  const stepList = getStepList(answers.goal);
  const currentIndex = stepList.indexOf(step) + 1;
  const result = step === "result" ? getQuizResult(answers) : null;

  function reset() {
    setAnswers(INITIAL_ANSWERS);
  }

  return (
    <section id="kviz" className="bg-navy-950 py-20 sm:py-28">
      <Container className="max-w-3xl">
        <SectionEyebrow tone="onDark">{QUIZ_INTRO.eyebrow[locale]}</SectionEyebrow>
        <h2 className="mt-4 font-display text-3xl uppercase leading-tight text-white sm:text-4xl">
          {QUIZ_INTRO.headline[locale]}
        </h2>
        <p className="mt-3 text-white/70">{QUIZ_INTRO.body[locale]}</p>

        <div className="mt-10 clip-corner-lg bg-navy-900 p-6 sm:p-10">
          <QuizProgressBar
            current={currentIndex}
            total={stepList.length}
            label={locale === "bs" ? "Napredak kroz kviz" : "Quiz progress"}
          />

          <div className="mt-8">
            <AnimatePresence mode="wait">
              {step === "goal" && (
                <QuizQuestion
                  key="goal"
                  text={GOAL_QUESTION.text[locale]}
                  options={GOAL_QUESTION.options}
                  locale={locale}
                  onSelect={(goal) => setAnswers((prev) => ({ ...prev, goal }))}
                />
              )}
              {step === "age" && (
                <QuizQuestion
                  key="age"
                  text={AGE_QUESTION.text[locale]}
                  options={AGE_QUESTION.options}
                  locale={locale}
                  onSelect={(age) => setAnswers((prev) => ({ ...prev, age }))}
                />
              )}
              {step === "experience" && (
                <QuizQuestion
                  key="experience"
                  text={EXPERIENCE_QUESTION.text[locale]}
                  options={EXPERIENCE_QUESTION.options}
                  locale={locale}
                  onSelect={(experience) =>
                    setAnswers((prev) => ({ ...prev, experience }))
                  }
                />
              )}
              {step === "result" && result && (
                <QuizResultCard key="result" result={result} locale={locale} onReset={reset} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </section>
  );
}
