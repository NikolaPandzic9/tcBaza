"use client";

import { motion, type Variants } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { PROGRAMS, getStartingPriceLabel } from "@/content/programs";
import { Container } from "@/components/ui/Container";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { LinkButton } from "@/components/ui/LinkButton";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { ProgramCard } from "./ProgramCard";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export function ProgramsOverviewGrid() {
  const locale = useLocale() as Locale;
  const t = useTranslations("cta");
  const reducedMotion = useReducedMotion();

  return (
    <section className="bg-white py-20 sm:py-28">
      <Container>
        <div className="max-w-2xl">
          <SectionEyebrow>
            {locale === "bs" ? "Programi" : "Programs"}
          </SectionEyebrow>
          <h2 className="mt-4 font-display text-3xl uppercase leading-tight text-navy-900 sm:text-4xl">
            {locale === "bs" ? "Izaberi svoj put" : "Choose your path"}
          </h2>
        </div>

        <motion.div
          variants={reducedMotion ? undefined : container}
          initial={reducedMotion ? undefined : "hidden"}
          whileInView={reducedMotion ? undefined : "visible"}
          viewport={{ once: true, margin: "-10%" }}
          className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {PROGRAMS.map((program) => (
            <motion.div key={program.slug} variants={reducedMotion ? undefined : item}>
              <ProgramCard
                program={program}
                locale={locale}
                priceLabel={getStartingPriceLabel(program, locale)}
              />
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-10">
          <LinkButton href="/usluge" variant="ghost">
            {t("seeAllServices")}
          </LinkButton>
        </div>
      </Container>
    </section>
  );
}
