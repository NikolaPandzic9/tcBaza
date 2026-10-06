import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { resolveLocale } from "@/i18n/resolveLocale";
import { buildPageMetadata } from "@/lib/seo";
import { getCommercialGymBlockedWindows } from "@/lib/commercialGymSchedule";
import { getSchedule, getSiteContent } from "@/server/site/content";
import { BookingContactMenu } from "@/components/contact/BookingContactMenu";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { CommercialGymScheduleGrid } from "@/components/schedule/CommercialGymScheduleGrid";
import { ScheduleSectionTabs } from "@/components/schedule/ScheduleSectionTabs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const isBs = locale === "bs";

  return buildPageMetadata({
    locale,
    path: "/rezervacija-termina/komercijalna-teretana",
    title: isBs ? "Teretana — slobodni termini" : "Open gym — available hours",
    description: isBs
      ? "Provjeri kada je teretana slobodna za samostalan trening — dostupna tokom cijelog radnog vremena, osim kad je grupni trening popunjen."
      : "Check when the gym floor is free for independent training — open all business hours, except when a group session is fully booked.",
  });
}

export default async function CommercialGymSchedulePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  setRequestLocale(locale);

  const [schedule, { info }] = await Promise.all([getSchedule(), getSiteContent()]);
  const blockedDays = getCommercialGymBlockedWindows(schedule.termini, schedule.commercialGymThreshold);
  const threshold = schedule.commercialGymThreshold;

  const t = {
    eyebrow: locale === "bs" ? "Termini" : "Schedule",
    headline: locale === "bs" ? "Komercijalna teretana" : "Commercial gym",
    body:
      locale === "bs"
        ? `Samostalan trening dostupan je tokom radnog vremena (${info.hours.opens}–${info.hours.closes}), osim u terminima kad je grupni trening popunjen sa ${threshold} ili više članova — tada teretana ustupa prostor grupi.`
        : `Independent training is available during business hours (${info.hours.opens}–${info.hours.closes}), except during group-training sessions with ${threshold} or more members — the floor is reserved for the group at those times.`,
    disabled:
      locale === "bs"
        ? "Raspored trenutno nije dostupan na sajtu. Za teretanu nas pozovi direktno."
        : "The schedule isn't published on the site right now. Call us directly about gym access.",
  };

  return (
    <main className="bg-navy-50 pb-20 pt-10 sm:pb-28 sm:pt-14">
      <Container>
        <PageHeader eyebrow={t.eyebrow} title={t.headline} description={t.body} />

        <div className="mt-8">
          <ScheduleSectionTabs active="komercijalna" locale={locale} />
        </div>

        {!schedule.enabled ? (
          <div className="mt-12 clip-corner-lg bg-white p-8 text-center shadow-sm ring-1 ring-charcoal-200 sm:p-12">
            <p className="text-charcoal-500">{t.disabled}</p>
            <div className="mt-5 flex justify-center">
              <BookingContactMenu locale={locale} />
            </div>
          </div>
        ) : (
          <div className="mt-12">
            <CommercialGymScheduleGrid days={blockedDays} locale={locale} />
          </div>
        )}
      </Container>
    </main>
  );
}
