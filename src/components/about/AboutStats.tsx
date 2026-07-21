"use client";

import { motion, type Variants } from "motion/react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";

interface Stat {
  value: string;
  label: string;
}

interface AboutStatsProps {
  stats: Stat[];
}

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// Real, derived counts only (group cap, team size, program count) —
// never a dramatized or invented figure. Given the site's own BOGAT
// tier for the About page, this uses the same stagger pattern as the
// homepage program grid instead of the lighter single-item reveal.
export function AboutStats({ stats }: AboutStatsProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={reducedMotion ? undefined : container}
      initial={reducedMotion ? undefined : "hidden"}
      whileInView={reducedMotion ? undefined : "visible"}
      viewport={{ once: true, margin: "-10%" }}
      className="grid gap-4 sm:grid-cols-3"
    >
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          variants={reducedMotion ? undefined : item}
          className="clip-corner bg-navy-50 p-6 text-center ring-1 ring-charcoal-200 sm:p-8"
        >
          <p className="font-display text-5xl text-navy-700 sm:text-6xl">{stat.value}</p>
          <p className="mt-2 text-sm font-medium text-charcoal-500">{stat.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
