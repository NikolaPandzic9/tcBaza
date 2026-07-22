import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { resolveLocale } from "@/i18n/resolveLocale";
import { getSiteSettings, getTermini } from "@/sanity/queries";
import { getCommercialGymBlockedWindows } from "@/lib/commercialGymSchedule";
import { BUSINESS } from "@/lib/constants";
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

  return {
    title:
      locale === "bs"
        ? "Komercijalna teretana — kada je dostupna"
        : "Commercial gym — when it's available",
    description:
      locale === "bs"
        ? "Samostalan pristup teretani van termina kad je grupni trening popunjen — provjeri kad je teretana slobodna."
        : "Independent gym access outside of fully-booked group sessions — check when the floor is free.",
  };
}

export default async function CommercialGymSchedulePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  setRequestLocale(locale);

  const settings = await getSiteSettings();
  const termini = settings.terminiSectionEnabled ? await getTermini() : [];
  const blockedDays = getCommercialGymBlockedWindows(termini);

  const t = {
    eyebrow: locale === "bs" ? "Termini" : "Schedule",
    headline: locale === "bs" ? "Komercijalna teretana" : "Commercial gym",
    body:
      locale === "bs"
        ? `Samostalan trening dostupan je tokom radnog vremena (${BUSINESS.hours.opens}–${BUSINESS.hours.closes}), osim u terminima kad je grupni trening popunjen sa 3 ili više članova — tada teretana ustupa prostor grupi.`
        : `Independent training is available during business hours (${BUSINESS.hours.opens}–${BUSINESS.hours.closes}), except during group-training sessions with 3 or more members — the floor is reserved for the group at those times.`,
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

        {!settings.terminiSectionEnabled ? (
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
