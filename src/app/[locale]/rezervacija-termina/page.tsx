import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { resolveLocale } from "@/i18n/resolveLocale";
import { getSiteSettings, getTermini } from "@/sanity/queries";
import { BUSINESS } from "@/lib/constants";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";
import { StatusLegend } from "@/components/schedule/StatusLegend";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);

  return {
    title: locale === "bs" ? "Termini — trenutni raspored" : "Schedule — current sessions",
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
    headline: locale === "bs" ? "Dostupni termini" : "Available sessions",
    body:
      locale === "bs"
        ? "Mjesta su ograničena na 5 članova po grupi. Rezervacija se trenutno potvrđuje pozivom ili porukom — online sistem stiže uskoro."
        : "Spots are capped at 5 members per group. Reservations are currently confirmed by phone or message — online booking is coming soon.",
    disabled:
      locale === "bs"
        ? "Raspored trenutno nije dostupan na sajtu. Za termine nas pozovi direktno."
        : "The schedule isn't published on the site right now. Call us directly for available sessions.",
    empty:
      locale === "bs"
        ? "Raspored termina se trenutno ažurira. Za dostupne termine pozovi nas direktno."
        : "The schedule is currently being updated. Call us directly for available sessions.",
    call: locale === "bs" ? "Pozovi" : "Call",
  };

  return (
    <main className="bg-navy-50 pb-20 pt-10 sm:pb-28 sm:pt-14">
      <Container>
        <PageHeader eyebrow={t.eyebrow} title={t.headline} description={t.body} />

        {!settings.terminiSectionEnabled ? (
          <div className="mt-12 clip-corner-lg bg-white p-8 text-center shadow-sm ring-1 ring-charcoal-200 sm:p-12">
            <p className="text-charcoal-500">{t.disabled}</p>
            <a
              href={BUSINESS.phoneHref}
              className="mt-4 inline-block font-display text-sm uppercase tracking-wide text-navy-700 underline decoration-accent-500 decoration-2 underline-offset-4"
            >
              {BUSINESS.phone}
            </a>
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
            <a
              href={BUSINESS.phoneHref}
              className="mt-4 inline-block font-display text-sm uppercase tracking-wide text-navy-700 underline decoration-accent-500 decoration-2 underline-offset-4"
            >
              {BUSINESS.phone}
            </a>
          </div>
        )}
      </Container>
    </main>
  );
}
