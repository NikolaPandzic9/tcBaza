import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { resolveLocale } from "@/i18n/resolveLocale";
import { getSiteSettings, getTermini } from "@/sanity/queries";
import { BookingContactMenu } from "@/components/contact/BookingContactMenu";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";
import { ScheduleSectionTabs } from "@/components/schedule/ScheduleSectionTabs";
import { StatusLegend } from "@/components/schedule/StatusLegend";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);

  return {
    title:
      locale === "bs"
        ? "Grupni treninzi — trenutni raspored"
        : "Group training — current schedule",
    description:
      locale === "bs"
        ? "Trenutni raspored grupnih treninga u Trening centru Baza — mjesta ograničena na 5 članova po grupi."
        : "The current group-training schedule at Trening centar Baza — spots capped at 5 members per group.",
  };
}

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  setRequestLocale(locale);

  const settings = await getSiteSettings();
  const termini = settings.terminiSectionEnabled ? await getTermini() : [];

  const t = {
    eyebrow: locale === "bs" ? "Termini" : "Schedule",
    headline: locale === "bs" ? "Grupni treninzi" : "Group training",
    body:
      locale === "bs"
        ? "Mjesta su ograničena na 5 članova po grupi. Rezervacija se trenutno potvrđuje pozivom ili porukom — online sistem stiže uskoro. Tražiš samostalan pristup teretani? Pogledaj Komercijalnu teretanu ispod."
        : "Spots are capped at 5 members per group. Reservations are currently confirmed by phone or message — online booking is coming soon. Looking for independent gym access? Check Commercial gym below.",
    disabled:
      locale === "bs"
        ? "Raspored trenutno nije dostupan na sajtu. Za termine nas pozovi direktno."
        : "The schedule isn't published on the site right now. Call us directly for available sessions.",
    empty:
      locale === "bs"
        ? "Raspored termina se trenutno ažurira. Za dostupne termine pozovi nas direktno."
        : "The schedule is currently being updated. Call us directly for available sessions.",
  };

  return (
    <main className="bg-navy-50 pb-20 pt-10 sm:pb-28 sm:pt-14">
      <Container>
        <PageHeader eyebrow={t.eyebrow} title={t.headline} description={t.body} />

        <div className="mt-8">
          <ScheduleSectionTabs active="grupni" locale={locale} />
        </div>

        {!settings.terminiSectionEnabled ? (
          <div className="mt-12 clip-corner-lg bg-white p-8 text-center shadow-sm ring-1 ring-charcoal-200 sm:p-12">
            <p className="text-charcoal-500">{t.disabled}</p>
            <div className="mt-5 flex justify-center">
              <BookingContactMenu locale={locale} />
            </div>
          </div>
        ) : termini.length > 0 ? (
          <div className="mt-12">
            <StatusLegend locale={locale} />
            <div className="mt-6">
              <ScheduleGrid termini={termini} locale={locale} />
            </div>
          </div>
        ) : (
          <div className="mt-12 clip-corner-lg bg-white p-8 text-center shadow-sm ring-1 ring-charcoal-200 sm:p-12">
            <p className="text-charcoal-500">{t.empty}</p>
            <div className="mt-5 flex justify-center">
              <BookingContactMenu locale={locale} />
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}
