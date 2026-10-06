import { createHash } from "node:crypto";
import { DEFAULT_HOME_FAQ } from "@/content/home";
import { DEFAULT_PARTNERS } from "@/content/partners";
import { DEFAULT_PROGRAM_DETAILS } from "@/content/programDetails";
import { DEFAULT_PROGRAMS } from "@/content/programs";
import { DEFAULT_RECOVERY_SERVICES } from "@/content/recovery";
import { DEFAULT_TEAM } from "@/content/team";
import { DEFAULT_CONTACT } from "@/lib/constants";
import type {
  FaqItemData,
  PartnerData,
  ProgramData,
  RecoveryServiceData,
  SiteSettingsData,
  TeamMemberData,
} from "./schemas";

/**
 * The site's original, hand-written content expressed as ERP documents.
 * Used twice: to seed a fresh database, and as the public site's fallback
 * when no database is configured — so both paths render identical pages.
 */

/** Deterministic UUID per static file, so documents can reference built-in
 * images by id before (and without) a media table. */
export function staticMediaId(path: string): string {
  const hex = createHash("sha1").update(`static:${path}`).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export interface StaticMedia {
  id: string;
  path: string;
  alt: { bs: string; en: string };
}

function collectStaticMedia(): StaticMedia[] {
  const byPath = new Map<string, StaticMedia>();
  const add = (path: string | null | undefined, alt = { bs: "", en: "" }) => {
    if (path && !byPath.has(path)) byPath.set(path, { id: staticMediaId(path), path, alt });
  };
  for (const detail of Object.values(DEFAULT_PROGRAM_DETAILS)) add(detail.image?.src, detail.image?.alt);
  for (const member of DEFAULT_TEAM) add(member.photo, { bs: member.name, en: member.name });
  for (const partner of DEFAULT_PARTNERS) add(partner.logo, { bs: partner.name, en: partner.name });
  return [...byPath.values()];
}

export const DEFAULT_STATIC_MEDIA = collectStaticMedia();

const mediaRef = (path: string | null | undefined) => (path ? staticMediaId(path) : null);

export function defaultPrograms(): { key: string; data: ProgramData }[] {
  return DEFAULT_PROGRAMS.map((program, index) => {
    const detail = DEFAULT_PROGRAM_DETAILS[program.slug];
    return {
      key: program.slug,
      data: {
        name: program.name,
        shortPitch: program.shortPitch,
        longDescription: detail.longDescription,
        features: detail.features,
        imageId: mediaRef(detail.image?.src),
        imageAlt: detail.image?.alt ?? { bs: "", en: "" },
        tiers: program.tiers.map((tier) => ({
          id: tier.id,
          label: tier.label,
          price: tier.price?.amount ?? null,
          sessionsPerWeek: tier.sessionsPerWeek,
        })),
        faq: detail.faq ?? [],
        order: index,
        visible: true,
      },
    };
  });
}

export function defaultTeam(): TeamMemberData[] {
  return DEFAULT_TEAM.map((member, index) => ({
    name: member.name,
    role: member.role,
    photoId: mediaRef(member.photo),
    // Everyone listed as "Trener" can lead a session; the massage
    // therapist can't.
    leadsSessions: member.role.bs === "Trener",
    order: index,
  }));
}

export function defaultPartners(): PartnerData[] {
  return DEFAULT_PARTNERS.map((partner, index) => ({
    name: partner.name,
    category: partner.category,
    description: partner.description,
    logoId: mediaRef(partner.logo),
    url: partner.url ?? "",
    order: index,
  }));
}

export function defaultRecoveryServices(): RecoveryServiceData[] {
  return DEFAULT_RECOVERY_SERVICES.map((service, index) => ({
    name: service.name,
    duration: service.duration ?? { bs: "", en: "" },
    prices: service.prices,
    benefits: service.benefits,
    order: index,
  }));
}

export function defaultHomeFaq(): FaqItemData[] {
  return DEFAULT_HOME_FAQ.map((item, index) => ({ ...item, order: index }));
}

export function defaultSiteSettings(): SiteSettingsData {
  return {
    phone: DEFAULT_CONTACT.phone,
    street: DEFAULT_CONTACT.street,
    city: DEFAULT_CONTACT.city,
    country: DEFAULT_CONTACT.country,
    email: "",
    instagramUrl: DEFAULT_CONTACT.instagramUrl,
    instagramHandle: DEFAULT_CONTACT.instagramHandle,
    hoursOpens: DEFAULT_CONTACT.hours.opens,
    hoursCloses: DEFAULT_CONTACT.hours.closes,
    terminiSectionEnabled: true,
    showOnlyActiveTermini: true,
    commercialGymThreshold: 3,
  };
}
