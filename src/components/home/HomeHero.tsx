"use client";

import { motion, useScroll, useTransform, type Variants } from "motion/react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useRef } from "react";
import { AngledDivider } from "@/components/ui/AngledDivider";
import { buttonBaseClasses, buttonVariantClasses } from "@/components/ui/buttonStyles";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { VertebraeDivider } from "@/components/ui/VertebraeDivider";
import { BookingContactMenu } from "@/components/contact/BookingContactMenu";
import { useMediaQuery } from "@/components/motion/useMediaQuery";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { HERO } from "@/content/home";
import { cn } from "@/lib/cn";
import type { Locale } from "@/i18n/routing";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function HomeHero() {
  const locale = useLocale() as Locale;
  const reducedMotion = useReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const parallaxEnabled = isDesktop && !reducedMotion;
  const parallaxY = useTransform(scrollYProgress, [0, 1], parallaxEnabled ? [0, 20] : [0, 0]);

  return (
    <section
      ref={containerRef}
      className="relative isolate flex min-h-[85vh] items-end overflow-hidden bg-navy-950 text-white"
    >
      <motion.div aria-hidden className="absolute inset-0" style={{ y: parallaxY }}>
        <Image
          src="/photos/hero-gym-interior.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_30%] opacity-70"
        />
      </motion.div>
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/20"
      />
      <VertebraeDivider className="pointer-events-none absolute inset-x-0 top-1/3 h-16 w-full text-white/10" />

      <motion.div
        variants={reducedMotion ? undefined : container}
        initial={reducedMotion ? undefined : "hidden"}
        animate={reducedMotion ? undefined : "visible"}
        className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 pt-32 sm:px-8 sm:pb-28"
      >
        <motion.div variants={reducedMotion ? undefined : item} className="motion-reveal">
          <SectionEyebrow tone="onDark">{HERO.eyebrow[locale]}</SectionEyebrow>
        </motion.div>
        <motion.h1
          variants={reducedMotion ? undefined : item}
          className="motion-reveal mt-4 max-w-3xl font-display text-4xl uppercase leading-[1.05] sm:text-6xl"
        >
          {HERO.headline[locale]}
        </motion.h1>
        <motion.p
          variants={reducedMotion ? undefined : item}
          className="motion-reveal mt-5 max-w-xl text-base text-white/80 sm:text-lg"
        >
          {HERO.body[locale]}
        </motion.p>
        <motion.div
          variants={reducedMotion ? undefined : item}
          className="motion-reveal mt-8 flex flex-wrap items-center gap-4"
        >
          <a
            href="#kviz"
            className={cn(buttonBaseClasses, buttonVariantClasses.secondary)}
          >
            {HERO.primaryCta[locale]}
          </a>
          <BookingContactMenu
            locale={locale}
            variant="ghost"
            className="bg-transparent text-white ring-1 ring-inset ring-white/40 hover:bg-white/10"
          />
        </motion.div>
      </motion.div>

      <AngledDivider className="absolute inset-x-0 bottom-0 z-10 bg-navy-50" />
    </section>
  );
}
