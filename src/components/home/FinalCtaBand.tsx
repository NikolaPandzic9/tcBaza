import { Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { FINAL_CTA } from "@/content/home";
import { BUSINESS } from "@/lib/constants";
import { Container } from "@/components/ui/Container";
import { VertebraeDivider } from "@/components/ui/VertebraeDivider";

interface FinalCtaBandProps {
  locale: Locale;
}

export function FinalCtaBand({ locale }: FinalCtaBandProps) {
  const t = useTranslations("cta");

  return (
    <section className="relative overflow-hidden bg-navy-700 py-16 text-white sm:py-20">
      <VertebraeDivider className="pointer-events-none absolute inset-x-0 top-1/2 h-20 w-full text-white/10" />
      <Container className="relative flex flex-col items-center gap-6 text-center">
        <h2 className="max-w-2xl font-display text-3xl uppercase leading-tight sm:text-4xl">
          {FINAL_CTA.headline[locale]}
        </h2>
        <p className="max-w-xl text-white/80">{FINAL_CTA.body[locale]}</p>
        <a
          href={BUSINESS.phoneHref}
          className="clip-corner inline-flex items-center gap-2 bg-accent-500 px-8 py-4 font-display text-sm uppercase tracking-wide text-navy-950 transition-colors hover:bg-white"
        >
          <Phone className="size-4" aria-hidden />
          {t("call")} — {BUSINESS.phone}
        </a>
      </Container>
    </section>
  );
}
