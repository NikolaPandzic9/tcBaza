"use client";

import { motion } from "motion/react";
import { Phone, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getProgram } from "@/content/programs";
import { BUSINESS } from "@/lib/constants";
import { buttonBaseClasses } from "@/components/ui/buttonStyles";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { cn } from "@/lib/cn";
import type { QuizResultSpec } from "./quizLogic";

interface QuizResultCardProps {
  result: QuizResultSpec;
  locale: Locale;
  onReset: () => void;
}

export function QuizResultCard({ result, locale, onReset }: QuizResultCardProps) {
  const t = useTranslations("cta");
  const reducedMotion = useReducedMotion();
  const program = getProgram(result.programSlug);
  const tier = result.tierId
    ? program.tiers.find((t) => t.id === result.tierId)
    : undefined;

  return (
    <motion.div
      className="motion-reveal"
      initial={reducedMotion ? undefined : { opacity: 0, scale: 0.97 }}
      animate={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <p className="font-display text-xs uppercase tracking-[0.3em] text-accent-500">
        {locale === "bs" ? "Tvoj program" : "Your program"}
      </p>
      <h3 className="mt-3 font-display text-3xl uppercase text-white sm:text-4xl">
        {program.name[locale]}
      </h3>

      {tier ? (
        <p className="mt-3 text-white/80">
          {tier.label[locale]}
          {tier.price && (
            <>
              {" — "}
              <span className="font-semibold text-accent-500">
                {tier.price.amount} {tier.price.period[locale]}
              </span>
            </>
          )}
        </p>
      ) : null}

      <p className="mt-4 max-w-md text-sm text-white/70">{result.reassurance[locale]}</p>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <a
          href={BUSINESS.phoneHref}
          className="clip-corner inline-flex items-center gap-2 bg-accent-500 px-6 py-3 font-display text-sm uppercase tracking-wide text-navy-950 transition-colors hover:bg-white"
        >
          <Phone className="size-4" aria-hidden />
          {t("call")}
        </a>
        <Link
          href={program.href}
          className={cn(
            buttonBaseClasses,
            "bg-transparent text-white ring-1 ring-inset ring-white/40 hover:bg-white/10",
          )}
        >
          {t("readMore")}
        </Link>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white"
        >
          <RotateCcw className="size-3.5" aria-hidden />
          {locale === "bs" ? "Ponovo" : "Start over"}
        </button>
      </div>
    </motion.div>
  );
}
