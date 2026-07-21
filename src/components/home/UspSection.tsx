import { Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { ABOUT_CHARACTERISTICS } from "@/content/about";
import { USP } from "@/content/home";
import { Container } from "@/components/ui/Container";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";

const FEATURED_INDEXES = [3, 4, 5, 6];

export function UspSection() {
  const locale = useLocale() as Locale;
  const t = useTranslations("cta");

  return (
    <section className="bg-navy-50 py-20 sm:py-28">
      <Container className="grid items-center gap-12 lg:grid-cols-2">
        <RevealOnScroll className="relative aspect-[4/5] w-full clip-corner-lg overflow-hidden bg-navy-900 lg:order-2">
          <Image
            src="/photos/testing-jump-assessment.jpg"
            alt={
              locale === "bs"
                ? "Testiranje eksplozivnosti na force-plate platformi u Bazi"
                : "Power assessment on a force-plate at Baza"
            }
            fill
            sizes="(min-width: 1024px) 42vw, 90vw"
            className="object-cover"
          />
        </RevealOnScroll>

        <RevealOnScroll delayMs={80} className="lg:order-1">
          <SectionEyebrow>{USP.eyebrow[locale]}</SectionEyebrow>
          <h2 className="mt-4 font-display text-3xl uppercase leading-tight text-navy-900 sm:text-4xl">
            {USP.headline[locale]}
          </h2>
          <p className="mt-5 text-charcoal-500">{USP.body[locale]}</p>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {FEATURED_INDEXES.map((index) => (
              <li key={index} className="flex items-start gap-2.5 text-sm text-charcoal-700">
                <Check className="mt-0.5 size-4 shrink-0 text-accent-ink-700" aria-hidden />
                {ABOUT_CHARACTERISTICS[index][locale]}
              </li>
            ))}
          </ul>

          <Link
            href="/o-nama"
            className="mt-8 inline-block text-sm font-semibold uppercase tracking-wide text-navy-700 underline decoration-accent-500 decoration-2 underline-offset-4 hover:text-navy-900"
          >
            {t("readMore")}
          </Link>
        </RevealOnScroll>
      </Container>
    </section>
  );
}
