import { ArrowUpRight, Check } from "lucide-react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { resolveLocale } from "@/i18n/resolveLocale";
import type { Pathnames } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { PROGRAMS, getStartingPriceLabel } from "@/content/programs";
import { PROGRAM_DETAILS } from "@/content/programDetails";
import { RECOVERY_INTRO, RECOVERY_SERVICES } from "@/content/recovery";
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
    title:
      locale === "bs"
        ? "Usluge — grupni treninzi, priprema sportista, oporavak"
        : "Services — group training, athlete prep, recovery",
    description:
      locale === "bs"
        ? "Rekreativci, sportisti, komercijalna teretana, kik boks i oporavak — sve usluge Trening centra Baza u Istočnom Sarajevu."
        : "Recreational, athletes, open gym access, kickboxing, and recovery — all of Trening centar Baza's services in Istočno Sarajevo.",
  };
}

export default async function UslugePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  setRequestLocale(locale);

  const cards: {
    href: Pathnames;
    name: string;
    pitch: string;
    priceLabel: string;
    features: string[];
  }[] = [
    ...PROGRAMS.map((program) => ({
      href: program.href,
      name: program.name[locale],
      pitch: program.shortPitch[locale],
      priceLabel: getStartingPriceLabel(program, locale),
      features: PROGRAM_DETAILS[program.slug].features.slice(0, 3).map((f) => f[locale]),
    })),
    {
      href: "/usluge/oporavak" as const,
      name: locale === "bs" ? "Oporavak" : "Recovery",
      pitch: RECOVERY_INTRO.body[locale],
      priceLabel: locale === "bs" ? "od 15 KM" : "from 15 KM",
      features: RECOVERY_SERVICES.slice(0, 3).map((service) => service.name[locale]),
    },
  ];

  return (
    <main className="bg-navy-50 pb-20 pt-10 sm:pb-28 sm:pt-14">
      <Container>
        <PageHeader
          eyebrow={locale === "bs" ? "Usluge" : "Services"}
          title={locale === "bs" ? "Sve što nudi Baza" : "Everything Baza offers"}
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, index) => (
            <RevealOnScroll key={card.href} delayMs={index * 60}>
              <Link
                href={card.href}
                className="group flex h-full flex-col justify-between clip-corner-lg bg-navy-700 p-7 text-white transition-colors hover:bg-navy-900"
              >
                <div>
                  <h2 className="font-display text-xl uppercase tracking-wide">
                    {card.name}
                  </h2>
                  <p className="mt-3 text-sm text-white/70">{card.pitch}</p>
                  <ul className="mt-5 space-y-2">
                    {card.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-xs text-white/60"
                      >
                        <Check className="mt-0.5 size-3.5 shrink-0 text-accent-500" aria-hidden />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8 flex items-end justify-between">
                  <span className="font-display text-sm uppercase tracking-wide text-accent-500">
                    {card.priceLabel}
                  </span>
                  <ArrowUpRight
                    className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden
                  />
                </div>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </Container>
    </main>
  );
}
