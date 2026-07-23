import { ArrowUpRight, Handshake } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { resolveLocale } from "@/i18n/resolveLocale";
import { PARTNERS } from "@/content/partners";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);

  return {
    title: locale === "bs" ? "Partneri" : "Partners",
    description:
      locale === "bs"
        ? "Partneri Trening centra Baza: KMF Tango, Kik boks klub Slavija i Studio Devet."
        : "Trening centar Baza's partners: KMF Tango, Kik boks klub Slavija, and Studio Devet.",
  };
}

export default async function PartnersPage({
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
          eyebrow={locale === "bs" ? "Partneri" : "Partners"}
          title={locale === "bs" ? "Uz koga radimo" : "Who we work with"}
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PARTNERS.map((partner, index) => {
            const card = (
              <>
                <div className="flex h-28 items-center justify-center clip-corner bg-navy-50 ring-1 ring-charcoal-100">
                  {partner.logo ? (
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={140}
                      height={90}
                      className="h-16 w-auto max-w-[75%] object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <Handshake className="size-9 text-accent-ink-700" aria-hidden />
                  )}
                </div>

                <p className="mt-5 font-display text-xs uppercase tracking-[0.2em] text-accent-ink-700">
                  {partner.category[locale]}
                </p>
                <h2 className="mt-2 font-display text-lg uppercase tracking-wide text-navy-900">
                  {partner.name}
                </h2>
                <p className="mt-2 text-sm text-charcoal-500">
                  {partner.description[locale]}
                </p>

                {partner.url && (
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-navy-700 underline decoration-accent-500 decoration-2 underline-offset-4 group-hover:text-navy-900">
                    {locale === "bs" ? "Posjeti sajt" : "Visit website"}
                    <ArrowUpRight
                      className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden
                    />
                  </span>
                )}
              </>
            );

            return (
              <RevealOnScroll
                key={partner.name}
                delayMs={index * 60}
                className="group clip-corner-lg bg-white p-7 shadow-sm ring-1 ring-charcoal-200 transition-shadow hover:shadow-lg"
              >
                {partner.url ? (
                  <a
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-500"
                  >
                    {card}
                  </a>
                ) : (
                  card
                )}
              </RevealOnScroll>
            );
          })}
        </div>
      </Container>
    </main>
  );
}
