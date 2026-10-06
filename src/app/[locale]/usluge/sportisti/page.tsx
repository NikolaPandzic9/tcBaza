import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { resolveLocale } from "@/i18n/resolveLocale";
import { buildPageMetadata } from "@/lib/seo";
import { getStartingPriceLabel } from "@/content/programs";
import { ProgramDetailTemplate } from "@/components/programs/ProgramDetailTemplate";
import { getProgramPage } from "@/server/site/content";

const SLUG = "sportisti" as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const isBs = locale === "bs";
  const page = await getProgramPage(SLUG);
  if (!page) return {};
  const priceLabel = getStartingPriceLabel(page.program, locale);

  return buildPageMetadata({
    locale,
    path: page.program.href,
    title: isBs ? "Kondiciona priprema sportista" : "Athlete strength & conditioning",
    description: isBs
      ? `Individualni plan nakon testiranja: eksplozivnost, snaga i prevencija povreda za tvoj sport. Priprema sportista u Istočnom Sarajevu, ${priceLabel}.`
      : `An individual plan after assessment: power, strength, and injury prevention for your sport. Athlete preparation in Istočno Sarajevo, ${priceLabel}.`,
  });
}

export default async function SportistiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  setRequestLocale(locale);

  // Hidden in the ERP → the page is gone until it's shown again.
  const page = await getProgramPage(SLUG);
  if (!page) notFound();

  return (
    <ProgramDetailTemplate
      program={page.program}
      detail={page.detail}
      locale={locale}
      info={page.content.info}
    />
  );
}
