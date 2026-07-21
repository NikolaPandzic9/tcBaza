import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { resolveLocale } from "@/i18n/resolveLocale";
import { TEAM, TEAM_INTRO } from "@/content/team";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { TeamMemberCard } from "@/components/team/TeamMemberCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);

  return {
    title: locale === "bs" ? "Naš tim — treneri Baze" : "Our team — Baza's trainers",
    description: TEAM_INTRO.body[locale],
  };
}

export default async function TeamPage({
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
          eyebrow={TEAM_INTRO.eyebrow[locale]}
          title={TEAM_INTRO.headline[locale]}
          description={TEAM_INTRO.body[locale]}
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((member, index) => (
            <RevealOnScroll key={member.name} delayMs={index * 60}>
              <TeamMemberCard member={member} locale={locale} />
            </RevealOnScroll>
          ))}
        </div>
      </Container>
    </main>
  );
}
