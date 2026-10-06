import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { resolveLocale } from "@/i18n/resolveLocale";
import { buildPageMetadata } from "@/lib/seo";
import { HomeHero } from "@/components/home/HomeHero";
import { UspSection } from "@/components/home/UspSection";
import { ProgramsOverviewGrid } from "@/components/home/ProgramsOverviewGrid";
import { ScheduleTeaser } from "@/components/home/ScheduleTeaser";
import { InstagramTeaser } from "@/components/home/InstagramTeaser";
import { FinalCtaBand } from "@/components/home/FinalCtaBand";
import { LocationFaqSection } from "@/components/home/LocationFaqSection";
import { ProgramQuiz } from "@/components/quiz/ProgramQuiz";
import { getSiteContent } from "@/server/site/content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const isBs = locale === "bs";

  return buildPageMetadata({
    locale,
    path: "/",
    absoluteTitle: true,
    title: isBs
      ? "Trening centar Baza — teretana i treninzi, Istočno Sarajevo"
      : "Trening centar Baza — Gym & Training in Istočno Sarajevo",
    description: isBs
      ? "Grupni treninzi do 5 članova uz individualni plan, priprema sportista, Sportski pasoš za djecu, teretana i masaža. Jovana Dučića 84, Istočno Sarajevo."
      : "Small-group training (max 5) with an individual plan, athlete conditioning, a sports program for kids, open gym and massage. Jovana Dučića 84, Istočno Sarajevo.",
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  setRequestLocale(locale);
  const content = await getSiteContent();

  return (
    <main>
      <HomeHero />
      <UspSection />
      <ProgramsOverviewGrid programs={content.programs} />
      <ProgramQuiz programs={content.programs} />
      <ScheduleTeaser locale={locale} />
      <InstagramTeaser locale={locale} info={content.info} />
      <LocationFaqSection locale={locale} info={content.info} faq={content.homeFaq} />
      <FinalCtaBand locale={locale} info={content.info} />
    </main>
  );
}
