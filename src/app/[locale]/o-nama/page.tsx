import { Check } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { resolveLocale } from "@/i18n/resolveLocale";
import {
  ABOUT_APPROACH,
  ABOUT_CHARACTERISTICS,
  ABOUT_HERO,
  ABOUT_INTRO,
  HOW_IT_WORKS,
} from "@/content/about";
import { PROGRAMS } from "@/content/programs";
import { TEAM } from "@/content/team";
import { AboutParallaxImage } from "@/components/about/AboutParallaxImage";
import { AboutStats } from "@/components/about/AboutStats";
import { Container } from "@/components/ui/Container";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { LinkButton } from "@/components/ui/LinkButton";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const isBs = locale === "bs";

  return {
    title: isBs
      ? "O nama — mali grupni treninzi u Istočnom Sarajevu"
      : "About us — small-group training in Istočno Sarajevo",
    description: isBs
      ? "Baza je trening centar sa grupama do 5 članova i individualnim planom nakon testiranja. Upoznaj koncept rada."
      : "Baza is a training center with groups of up to 5 members and an individual plan after assessment. Meet the concept.",
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  setRequestLocale(locale);
  const isBs = locale === "bs";

  const stats = [
    { value: "5", label: isBs ? "Maks. članova po grupi" : "Max members per group" },
    { value: String(TEAM.length), label: isBs ? "Stručnjaka u timu" : "Specialists on the team" },
    {
      value: String(PROGRAMS.length + 1),
      label: isBs ? "Programa i usluga" : "Programs & services",
    },
  ];

  return (
    <main className="bg-navy-50">
      <section className="pb-16 pt-10 sm:pb-20 sm:pt-14">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionEyebrow>{ABOUT_HERO.eyebrow[locale]}</SectionEyebrow>
            <h1 className="mt-5 font-display text-4xl uppercase leading-[0.95] tracking-tight text-navy-900 sm:text-5xl lg:text-6xl">
              {ABOUT_HERO.headline[locale]}
            </h1>
            <span aria-hidden className="clip-corner mt-5 block h-1.5 w-20 bg-accent-500" />
            <p className="mt-6 text-lg text-charcoal-500">{ABOUT_INTRO[locale]}</p>
          </div>

          <AboutParallaxImage
            alt={
              isBs
                ? "Trening centar Baza — prostor i oprema"
                : "Baza training center — space and equipment"
            }
          />
        </Container>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <Container>
          <AboutStats stats={stats} />
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <div className="max-w-2xl">
            <SectionEyebrow>
              {isBs ? "Karakteristike" : "What defines us"}
            </SectionEyebrow>
            <h2 className="mt-4 font-display text-3xl uppercase leading-tight text-navy-900 sm:text-4xl">
              {isBs ? "Šta Bazu čini drugačijom" : "What makes Baza different"}
            </h2>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ABOUT_CHARACTERISTICS.map((characteristic, index) => (
              <RevealOnScroll
                key={characteristic.bs}
                delayMs={index * 40}
                className="flex items-start gap-3 clip-corner bg-white p-5 shadow-sm ring-1 ring-charcoal-200"
              >
                <Check className="mt-0.5 size-5 shrink-0 text-accent-ink-700" aria-hidden />
                <span className="text-sm font-medium text-charcoal-700">
                  {characteristic[locale]}
                </span>
              </RevealOnScroll>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <RevealOnScroll className="relative aspect-[4/5] w-full clip-corner-lg overflow-hidden bg-navy-900">
            <Image
              src="/photos/testing-trainer-client.jpg"
              alt={
                isBs
                  ? "Trener radi individualno sa članom u Bazi"
                  : "A trainer working one-on-one with a member at Baza"
              }
              fill
              sizes="(min-width: 1024px) 42vw, 90vw"
              className="object-cover"
            />
          </RevealOnScroll>

          <RevealOnScroll delayMs={80}>
            <SectionEyebrow>{ABOUT_APPROACH.eyebrow[locale]}</SectionEyebrow>
            <h2 className="mt-4 font-display text-3xl uppercase leading-tight text-navy-900 sm:text-4xl">
              {ABOUT_APPROACH.headline[locale]}
            </h2>
            <p className="mt-5 text-charcoal-500">{ABOUT_APPROACH.body[locale]}</p>
          </RevealOnScroll>
        </Container>
      </section>

      <section className="bg-navy-950 py-20 text-white sm:py-28">
        <Container>
          <div className="max-w-2xl">
            <SectionEyebrow tone="onDark">{HOW_IT_WORKS.eyebrow[locale]}</SectionEyebrow>
            <h2 className="mt-4 font-display text-3xl uppercase leading-tight sm:text-4xl">
              {HOW_IT_WORKS.headline[locale]}
            </h2>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {HOW_IT_WORKS.steps.map((step, index) => (
              <RevealOnScroll key={step.title.bs} delayMs={index * 80}>
                <span className="font-display text-4xl text-accent-500">
                  0{index + 1}
                </span>
                <h3 className="mt-4 font-display text-lg uppercase tracking-wide">
                  {step.title[locale]}
                </h3>
                <p className="mt-2 text-sm text-white/70">{step.body[locale]}</p>
              </RevealOnScroll>
            ))}
          </div>

          <div className="mt-16 border-t border-white/10 pt-12">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <p className="font-display text-sm uppercase tracking-wide text-white/60">
                {isBs ? "Ljudi iza svakog treninga" : "The people behind every session"}
              </p>
              <LinkButton href="/nas-tim" variant="secondary">
                {isBs ? "Upoznaj naš tim" : "Meet our team"}
              </LinkButton>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {TEAM.map((member) => (
                <div
                  key={member.name}
                  className="flex items-center gap-2.5 clip-corner bg-white/5 py-1.5 pl-1.5 pr-3 ring-1 ring-white/10"
                >
                  <span className="relative size-9 shrink-0 overflow-hidden clip-corner bg-navy-700">
                    {member.photo ? (
                      <Image
                        src={member.photo}
                        alt=""
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    ) : null}
                  </span>
                  <span className="text-xs font-medium text-white/80">{member.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
