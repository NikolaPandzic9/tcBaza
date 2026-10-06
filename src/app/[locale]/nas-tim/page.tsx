import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { resolveLocale } from "@/i18n/resolveLocale";
import { buildPageMetadata } from "@/lib/seo";
import { TEAM_INTRO } from "@/content/team";
import { getSiteContent } from "@/server/site/content";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { TeamMemberCard } from "@/components/team/TeamMemberCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORGANIZATION_ID } from "@/lib/businessSchema";
import { SITE_URL } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const isBs = locale === "bs";

  return buildPageMetadata({
    locale,
    path: "/nas-tim",
    title: isBs ? "Naš tim — treneri i maser" : "Our team — trainers and massage therapist",
    description: isBs
      ? "Upoznaj tim Trening centra Baza: stručni treneri na svakom treningu, grupe do 5 članova i maser za oporavak. Istočno Sarajevo."
      : "Meet the Trening centar Baza team: qualified trainers at every session, groups of up to 5, and a massage therapist for recovery. Istočno Sarajevo.",
  });
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  setRequestLocale(locale);
  const content = await getSiteContent();

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: content.team.map((member, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Person",
        name: member.name,
        jobTitle: member.role[locale],
        ...(member.photo
          ? { image: member.photo.startsWith("http") ? member.photo : `${SITE_URL}${member.photo}` }
          : {}),
        worksFor: { "@id": ORGANIZATION_ID },
      },
    })),
  };

  return (
    <main className="bg-navy-50 pb-20 pt-10 sm:pb-28 sm:pt-14">
      <JsonLd data={schema} />
      <Container>
        <PageHeader
          eyebrow={TEAM_INTRO.eyebrow[locale]}
          title={TEAM_INTRO.headline[locale]}
          description={TEAM_INTRO.body[locale]}
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {content.team.map((member, index) => (
            <RevealOnScroll key={member.name} delayMs={index * 60}>
              <TeamMemberCard member={member} locale={locale} />
            </RevealOnScroll>
          ))}
        </div>
      </Container>
    </main>
  );
}
