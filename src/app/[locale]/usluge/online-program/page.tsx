import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { resolveLocale } from "@/i18n/resolveLocale";
import { buildPageMetadata } from "@/lib/seo";
import { ProgramDetailTemplate } from "@/components/programs/ProgramDetailTemplate";
import { getProgramPage } from "@/server/site/content";

const SLUG = "online-program" as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const isBs = locale === "bs";
  const page = await getProgramPage(SLUG);
  if (!page) return {};

  return buildPageMetadata({
    locale,
    path: page.program.href,
    title: isBs ? "Online trening program — plan na daljinu" : "Online training program — remote coaching",
    description: isBs
      ? "Individualni trening plan i praćenje napretka na daljinu — za sve koji ne mogu redovno doći u Bazu. Plan izrađen za tebe, ne generički šablon."
      : "An individual training plan and remote progress tracking — for anyone who can't make it to Baza regularly. A plan built for you, not a generic template.",
  });
}

export default async function OnlineProgramPage({
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
