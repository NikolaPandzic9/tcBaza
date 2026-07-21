import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { resolveLocale } from "@/i18n/resolveLocale";
import { Link } from "@/i18n/navigation";
import { PROGRAMS } from "@/content/programs";
import { RECOVERY_SERVICES } from "@/content/recovery";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { PricingTable } from "@/components/pricing/PricingTable";
import { RecoveryServiceCard } from "@/components/recovery/RecoveryServiceCard";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);

  return {
    title:
      locale === "bs"
        ? "Članarine i cijene — svi programi"
        : "Membership & Pricing — all programs",
    description:
      locale === "bs"
        ? "Cjenovnik za sve programe Trening centra Baza: rekreativci, sportisti, komercijalna teretana, kik boks i oporavak."
        : "The full price list for Trening centar Baza: recreational, athletes, open gym access, kickboxing, and recovery.",
  };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  setRequestLocale(locale);

  return (
    <main className="bg-navy-50 pb-20 pt-10 sm:pb-28 sm:pt-14">
      <Container>
        <PageHeader
          eyebrow={locale === "bs" ? "Cjenovnik" : "Pricing"}
          title={locale === "bs" ? "Članarine i cijene" : "Membership & Pricing"}
          description={
            locale === "bs"
              ? "Sve cijene su mjesečne osim ako je drugačije navedeno. Za kik boks (trener, cijena) nas kontaktiraj direktno."
              : "All prices are monthly unless stated otherwise. For kickboxing (trainer, price), contact us directly."
          }
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          {PROGRAMS.map((program, index) => (
            <RevealOnScroll key={program.slug} delayMs={index * 60}>
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-display text-xl uppercase tracking-wide text-navy-900">
                  {program.name[locale]}
                </h2>
                <Link
                  href={program.href}
                  className="shrink-0 text-xs font-semibold uppercase tracking-wide text-navy-700 underline decoration-accent-500 decoration-2 underline-offset-4 hover:text-navy-900"
                >
                  {locale === "bs" ? "Detalji" : "Details"}
                </Link>
              </div>
              <div className="mt-4">
                <PricingTable tiers={program.tiers} locale={locale} />
              </div>
            </RevealOnScroll>
          ))}
        </div>

        <div className="mt-20">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-2xl uppercase tracking-wide text-navy-900">
              {locale === "bs" ? "Oporavak" : "Recovery"}
            </h2>
            <Link
              href="/usluge/oporavak"
              className="shrink-0 text-xs font-semibold uppercase tracking-wide text-navy-700 underline decoration-accent-500 decoration-2 underline-offset-4 hover:text-navy-900"
            >
              {locale === "bs" ? "Detalji" : "Details"}
            </Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {RECOVERY_SERVICES.map((service, index) => (
              <RevealOnScroll key={service.slug} delayMs={index * 60}>
                <RecoveryServiceCard service={service} locale={locale} />
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}
