"use client";

import { motion } from "motion/react";
import type { Locale } from "@/i18n/routing";
import type { QuizOption } from "@/content/quiz";
import { useReducedMotion } from "@/components/motion/useReducedMotion";

interface QuizQuestionProps<T extends string> {
  text: string;
  options: QuizOption<T>[];
  locale: Locale;
  onSelect: (value: T) => void;
}

export function QuizQuestion<T extends string>({
  text,
  options,
  locale,
  onSelect,
}: QuizQuestionProps<T>) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className="motion-reveal"
      initial={reducedMotion ? undefined : { opacity: 0, x: 16 }}
      animate={reducedMotion ? undefined : { opacity: 1, x: 0 }}
      exit={reducedMotion ? undefined : { opacity: 0, x: -16 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <h3 className="font-display text-xl uppercase text-white sm:text-2xl">
        {text}
      </h3>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className="min-h-11 clip-corner bg-white/5 px-5 py-4 text-left text-sm font-semibold text-white ring-1 ring-inset ring-white/15 transition-colors hover:bg-accent-500 hover:text-navy-950 hover:ring-accent-500"
          >
            {option.label[locale]}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
