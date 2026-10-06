import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { resolveLocale } from "@/i18n/resolveLocale";
import { buildPageMetadata } from "@/lib/seo";
import { getStartingPriceLabel } from "@/content/programs";
import { ProgramDetailTemplate } from "@/components/programs/ProgramDetailTemplate";
import { getProgramPage } from "@/server/site/content";

const SLUG = "komercijalna-teretana" as const;

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
  const { info } = page.content;

  return buildPageMetadata({
    locale,
    path: page.program.href,
    title: isBs ? `Teretana — članarina ${priceLabel}` : `Open gym — membership ${priceLabel}`,
    description: isBs
      ? `Opremljena teretana u Istočnom Sarajevu za samostalan trening, svaki dan ${info.hours.opens}–${info.hours.closes}, u terminima van grupnih treninga. Članarina ${priceLabel}.`
      : `A fully equipped gym in Istočno Sarajevo for independent training, every day ${info.hours.opens}–${info.hours.closes}, outside group-session slots. Membership ${priceLabel}.`,
  });
}

export default async function KomercijalnaTeretanaPage({
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
