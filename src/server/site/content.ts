import { unstable_cache } from "next/cache";
import type { FaqItem, ProgramDetail } from "@/content/programDetails";
import type { Partner } from "@/content/partners";
import {
  MONTHLY_PERIOD,
  PROGRAM_HREFS,
  isProgramSlug,
  type Localized,
  type Program,
  type ProgramSlug,
} from "@/content/programs";
import type { RecoveryService } from "@/content/recovery";
import type { TeamMember } from "@/content/team";
import { TERMIN_DAYS, type ScheduleData, type Termin } from "@/lib/schedule";
import { buildSiteInfo, type SiteInfo } from "@/lib/siteInfo";
import { getDb, hasDatabase } from "../db/client";
import { listPublished } from "../content/documents";
import {
  DEFAULT_STATIC_MEDIA,
  defaultHomeFaq,
  defaultPartners,
  defaultPrograms,
  defaultRecoveryServices,
  defaultSiteSettings,
  defaultTeam,
} from "../content/defaults";
import {
  contentTag,
  type FaqItemData,
  type PartnerData,
  type ProgramData,
  type RecoveryServiceData,
  type SiteSettingsData,
  type TeamMemberData,
} from "../content/schemas";
import { getMediaByIds } from "../media/media";
import { enrollmentCounts } from "../members/enrollments";

/* ------------------------------------------------------------------ */
/* Shapes                                                              */
/* ------------------------------------------------------------------ */

export interface SiteContent {
  info: SiteInfo;
  /** Visible programs, in display order. */
  programs: Program[];
  details: Partial<Record<ProgramSlug, ProgramDetail>>;
  team: TeamMember[];
  partners: Partner[];
  recovery: RecoveryService[];
  homeFaq: FaqItem[];
}

interface DocSets {
  program: { key: string | null; data: ProgramData }[];
  teamMember: { id: string; data: TeamMemberData }[];
  partner: { id: string; data: PartnerData }[];
  recoveryService: { id: string; data: RecoveryServiceData }[];
  faqItem: { id: string; data: FaqItemData }[];
  siteSettings: SiteSettingsData;
}

type ResolvedMedia = { url: string; alt: Localized };
type MediaResolver = (id: string | null) => ResolvedMedia | null;

/** English is optional in the ERP — the site falls back to Bosnian. */
const fill = (value: { bs: string; en?: string }): Localized => ({
  bs: value.bs,
  en: value.en?.trim() ? value.en : value.bs,
});

const byOrder = <T extends { data: { order: number } }>(a: T, b: T) => a.data.order - b.data.order;

function build(docs: DocSets, resolve: MediaResolver): SiteContent {
  const programs = docs.program
    .filter((p): p is { key: ProgramSlug; data: ProgramData } => Boolean(p.key && isProgramSlug(p.key)))
    .filter((p) => p.data.visible)
    .sort(byOrder);

  const details: SiteContent["details"] = {};
  for (const { key, data } of programs) {
    const image = resolve(data.imageId);
    details[key] = {
      longDescription: fill(data.longDescription),
      features: data.features.map(fill),
      image: image
        ? { src: image.url, alt: fill(data.imageAlt.bs ? data.imageAlt : image.alt) }
        : null,
      faq: data.faq.map((f) => ({ question: fill(f.question), answer: fill(f.answer) })),
    };
  }

  const s = docs.siteSettings;
  return {
    info: buildSiteInfo(s),
    programs: programs.map(({ key, data }) => ({
      slug: key,
      href: PROGRAM_HREFS[key],
      name: fill(data.name),
      shortPitch: fill(data.shortPitch),
      tiers: data.tiers.map((tier) => ({
        id: tier.id,
        label: fill(tier.label),
        price: tier.price === null ? null : { amount: tier.price, period: MONTHLY_PERIOD },
        sessionsPerWeek: tier.sessionsPerWeek,
      })),
    })),
    details,
    team: [...docs.teamMember].sort(byOrder).map(({ data }) => ({
      name: data.name,
      role: fill(data.role),
      photo: resolve(data.photoId)?.url ?? null,
    })),
    partners: [...docs.partner].sort(byOrder).map(({ data }) => ({
      name: data.name,
      category: fill(data.category),
      description: fill(data.description),
      logo: resolve(data.logoId)?.url ?? null,
      url: data.url || undefined,
    })),
    recovery: [...docs.recoveryService].sort(byOrder).map(({ id, data }) => ({
      slug: id,
      name: fill(data.name),
      duration: data.duration.bs ? fill(data.duration) : null,
      prices: data.prices.map((p) => ({ label: fill(p.label), amount: p.amount })),
      benefits: data.benefits.map(fill),
    })),
    homeFaq: [...docs.faqItem].sort(byOrder).map(({ data }) => ({
      question: fill(data.question),
      answer: fill(data.answer),
    })),
  };
}

/* ------------------------------------------------------------------ */
/* Sources                                                             */
/* ------------------------------------------------------------------ */

function fromDefaults(): SiteContent {
  const staticMedia = new Map(DEFAULT_STATIC_MEDIA.map((m) => [m.id, { url: m.path, alt: m.alt }]));
  return build(
    {
      program: defaultPrograms(),
      teamMember: defaultTeam().map((data, i) => ({ id: `default-team-${i}`, data })),
      partner: defaultPartners().map((data, i) => ({ id: `default-partner-${i}`, data })),
      recoveryService: defaultRecoveryServices().map((data, i) => ({ id: `default-recovery-${i}`, data })),
      faqItem: defaultHomeFaq().map((data, i) => ({ id: `default-faq-${i}`, data })),
      siteSettings: defaultSiteSettings(),
    },
    (id) => (id ? (staticMedia.get(id) ?? null) : null),
  );
}

async function fromDatabase(): Promise<SiteContent> {
  const db = getDb();
  const [program, teamMember, partner, recoveryService, faqItem, settings] = await Promise.all([
    listPublished(db, "program"),
    listPublished(db, "teamMember"),
    listPublished(db, "partner"),
    listPublished(db, "recoveryService"),
    listPublished(db, "faqItem"),
    listPublished(db, "siteSettings"),
  ]);

  const mediaIds = new Set<string>();
  for (const { data } of program) if (data.imageId) mediaIds.add(data.imageId);
  for (const { data } of teamMember) if (data.photoId) mediaIds.add(data.photoId);
  for (const { data } of partner) if (data.logoId) mediaIds.add(data.logoId);
  const media = await getMediaByIds(db, [...mediaIds]);

  return build(
    {
      program,
      teamMember,
      partner,
      recoveryService,
      faqItem,
      siteSettings: settings[0]?.data ?? defaultSiteSettings(),
    },
    (id) => {
      const item = id ? media.get(id) : undefined;
      return item ? { url: item.url, alt: item.alt } : null;
    },
  );
}

const CONTENT_TAGS = [
  contentTag("program"),
  contentTag("teamMember"),
  contentTag("partner"),
  contentTag("recoveryService"),
  contentTag("faqItem"),
  contentTag("siteSettings"),
];

const cachedContent = unstable_cache(fromDatabase, ["site-content-v1"], {
  tags: CONTENT_TAGS,
  // Safety net only — ERP edits expire the tags immediately.
  revalidate: 3600,
});

/**
 * Everything the public pages render, from the ERP's published documents.
 * Errors are not swallowed into default content: a failed revalidation
 * keeps serving the last good page instead of silently reverting edits.
 */
export async function getSiteContent(): Promise<SiteContent> {
  return hasDatabase ? cachedContent() : fromDefaults();
}

export async function getProgramPage(slug: ProgramSlug) {
  const content = await getSiteContent();
  const program = content.programs.find((p) => p.slug === slug);
  const detail = content.details[slug];
  return program && detail ? { program, detail, content } : null;
}

/* ------------------------------------------------------------------ */
/* Schedule                                                            */
/* ------------------------------------------------------------------ */

async function scheduleFromDatabase(): Promise<ScheduleData> {
  const db = getDb();
  const [termini, programs, team, settings, counts] = await Promise.all([
    listPublished(db, "termin"),
    listPublished(db, "program"),
    listPublished(db, "teamMember"),
    listPublished(db, "siteSettings"),
    enrollmentCounts(db),
  ]);
  const s = settings[0]?.data ?? defaultSiteSettings();
  const programNames = new Map(programs.map((p) => [p.key, fill(p.data.name)]));
  const trainerNames = new Map(team.map((t) => [t.id, t.data.name]));

  const list: Termin[] = termini
    .filter(({ data }) => !s.showOnlyActiveTermini || data.active)
    .map(({ id, data }) => {
      const enrolled = counts.get(id) ?? 0;
      const spotsRemaining = Math.max(data.maxParticipants - enrolled, 0);
      const baseName = programNames.get(data.programKey) ?? { bs: data.programKey, en: data.programKey };
      const group = fill(data.group);
      return {
        id,
        programKey: data.programKey,
        programName: group.bs
          ? { bs: `${baseName.bs} ${group.bs}`, en: `${baseName.en} ${group.en}` }
          : baseName,
        dayOfWeek: data.dayOfWeek,
        specificDate: data.specificDate,
        startTime: data.startTime,
        endTime: data.endTime,
        trainerName: data.trainerId ? (trainerNames.get(data.trainerId) ?? null) : null,
        maxParticipants: data.maxParticipants,
        spotsRemaining,
        // A full group reads as full, even if nobody flipped the status.
        status: data.status === "Slobodno" && spotsRemaining === 0 ? "Popunjeno" : data.status,
        note: data.note,
        colorTag: data.colorTag,
        displayOrder: data.displayOrder,
        featured: data.featured,
        active: data.active,
      };
    })
    .sort(
      (a, b) =>
        TERMIN_DAYS.indexOf(a.dayOfWeek) - TERMIN_DAYS.indexOf(b.dayOfWeek) ||
        a.startTime.localeCompare(b.startTime) ||
        a.displayOrder - b.displayOrder,
    );

  return { enabled: s.terminiSectionEnabled, termini: list, commercialGymThreshold: s.commercialGymThreshold };
}

const cachedSchedule = unstable_cache(scheduleFromDatabase, ["site-schedule-v1"], {
  tags: [contentTag("termin"), contentTag("siteSettings"), contentTag("teamMember"), contentTag("program")],
  revalidate: 300,
});

export async function getSchedule(): Promise<ScheduleData> {
  if (!hasDatabase) return { enabled: true, termini: [], commercialGymThreshold: 3 };
  return cachedSchedule();
}
