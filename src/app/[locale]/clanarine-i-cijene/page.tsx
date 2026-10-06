import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { resolveLocale } from "@/i18n/resolveLocale";
import { buildPageMetadata } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { getSiteContent } from "@/server/site/content";
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
  const isBs = locale === "bs";

  return buildPageMetadata({
    locale,
    path: "/clanarine-i-cijene",
    title: isBs ? "Članarine i cijene treninga" : "Membership & training prices",
    description: isBs
      ? "Cjenovnik Trening centra Baza: grupni treninzi od 150 KM, teretana 50 KM, Sportski pasoš za djecu 80 KM mjesečno i oporavak od 15 KM. Istočno Sarajevo."
      : "Trening centar Baza price list: group training from 150 KM, open gym 50 KM, the Sports Passport kids program 80 KM per month, and recovery from 15 KM.",
  });
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  setRequestLocale(locale);
  const content = await getSiteContent();

  return (
    <main className="bg-navy-50 pb-20 pt-10 sm:pb-28 sm:pt-14">
      <Container>
        <PageHeader
          eyebrow={locale === "bs" ? "Cjenovnik" : "Pricing"}
          title={locale === "bs" ? "Članarine i cijene" : "Membership & Pricing"}
          description={
            locale === "bs"
              ? "Sve cijene su mjesečne osim ako je drugačije navedeno. Za online program cijenu dogovaramo direktno — pozovi ili piši."
              : "All prices are monthly unless stated otherwise. Online program pricing is arranged directly — call or message us."
          }
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          {content.programs.map((program, index) => (
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
            {content.recovery.map((service, index) => (
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
