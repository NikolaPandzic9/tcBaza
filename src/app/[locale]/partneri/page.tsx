import { Handshake } from "lucide-react";
import type { Metadata } from "next";
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
        ? "Partneri Trening centra Baza: KMF Tango i Kik boks klub Slavija."
        : "Trening centar Baza's partners: KMF Tango and Kik boks klub Slavija.",
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

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {PARTNERS.map((partner, index) => (
            <RevealOnScroll
              key={partner.name}
              delayMs={index * 60}
              className="clip-corner-lg bg-white p-7 shadow-sm ring-1 ring-charcoal-200 transition-shadow hover:shadow-md"
            >
              <Handshake className="size-8 text-accent-ink-700" aria-hidden />
              <h2 className="mt-4 font-display text-lg uppercase tracking-wide text-navy-900">
                {partner.name}
              </h2>
              <p className="mt-2 text-sm text-charcoal-500">
                {partner.description[locale]}
              </p>
            </RevealOnScroll>
          ))}
        </div>
      </Container>
    </main>
  );
}
