import { getSiteSettings, getTermini } from "@/sanity/queries";
import type { Locale } from "@/i18n/routing";
import { SCHEDULE_TEASER } from "@/content/home";
import { BUSINESS } from "@/lib/constants";
import { Container } from "@/components/ui/Container";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { LinkButton } from "@/components/ui/LinkButton";
import { TerminCard } from "@/components/schedule/TerminCard";

const PREVIEW_COUNT = 4;

interface ScheduleTeaserProps {
  locale: Locale;
}

export async function ScheduleTeaser({ locale }: ScheduleTeaserProps) {
  const settings = await getSiteSettings();
  if (!settings.terminiSectionEnabled) return null;

  const termini = await getTermini();
  const preview = termini.slice(0, PREVIEW_COUNT);

  return (
    <section className="bg-navy-100 py-20 sm:py-28">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <SectionEyebrow>{SCHEDULE_TEASER.eyebrow[locale]}</SectionEyebrow>
            <h2 className="mt-4 font-display text-3xl uppercase leading-tight text-navy-900 sm:text-4xl">
              {SCHEDULE_TEASER.headline[locale]}
            </h2>
            <p className="mt-3 text-charcoal-500">{SCHEDULE_TEASER.body[locale]}</p>
          </div>
        </div>

        {preview.length > 0 ? (
          <>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {preview.map((termin) => (
                <TerminCard key={termin._id} termin={termin} locale={locale} />
              ))}
            </div>
            <div className="mt-10">
              <LinkButton href="/rezervacija-termina">
                {locale === "bs" ? "Svi termini" : "Full schedule"}
              </LinkButton>
            </div>
          </>
        ) : (
          <div className="mt-10 clip-corner-lg bg-white p-8 text-center shadow-sm ring-1 ring-charcoal-200 sm:p-12">
            <p className="text-charcoal-500">{SCHEDULE_TEASER.emptyState[locale]}</p>
            <a
              href={BUSINESS.phoneHref}
              className="mt-4 inline-block font-display text-sm uppercase tracking-wide text-navy-700 underline decoration-accent-500 decoration-2 underline-offset-4"
            >
              {BUSINESS.phone}
            </a>
          </div>
        )}
      </Container>
    </section>
  );
}
