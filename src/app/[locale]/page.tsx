import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { resolveLocale } from "@/i18n/resolveLocale";
import { HomeHero } from "@/components/home/HomeHero";
import { UspSection } from "@/components/home/UspSection";
import { ProgramsOverviewGrid } from "@/components/home/ProgramsOverviewGrid";
import { ScheduleTeaser } from "@/components/home/ScheduleTeaser";
import { InstagramTeaser } from "@/components/home/InstagramTeaser";
import { FinalCtaBand } from "@/components/home/FinalCtaBand";
import { ProgramQuiz } from "@/components/quiz/ProgramQuiz";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const isBs = locale === "bs";

  return {
    title: isBs
      ? "Istočno Sarajevo — Personalizovani grupni treninzi"
      : "Istočno Sarajevo — Personalized Group Training",
    description: isBs
      ? "Male grupe do 5 članova, individualni plan nakon testiranja i oporavak. Trening centar Baza, Istočno Sarajevo."
      : "Small groups of up to 5, an individual plan after assessment, and recovery services. Baza training center, Istočno Sarajevo.",
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  setRequestLocale(locale);

  return (
    <main>
      <HomeHero />
      <UspSection />
      <ProgramsOverviewGrid />
      <ProgramQuiz />
      <ScheduleTeaser locale={locale} />
      <InstagramTeaser locale={locale} />
      <FinalCtaBand locale={locale} />
    </main>
  );
}
