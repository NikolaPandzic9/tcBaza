import { z } from "zod";

/**
 * Validation + shape for every publishable content type the ERP manages.
 * Shared by the ERP forms (server-side validation), the seed, and the
 * public-site loaders, so the three can never disagree about a field.
 */

export const DAYS = [
  "Ponedjeljak",
  "Utorak",
  "Srijeda",
  "Četvrtak",
  "Petak",
  "Subota",
  "Nedjelja",
] as const;
export const TERMIN_STATUSES = ["Slobodno", "Popunjeno", "Otkazano", "Uskoro"] as const;
export const COLOR_TAGS = ["Navy", "Zelena", "Jantar", "Crvena", "Siva", "Tirkizna"] as const;

/** Programs without a coach (members train on their own). */
export const SELF_GUIDED_PROGRAMS = ["komercijalna-teretana"] as const;

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const text = (max = 2000) => z.string().trim().max(max, `Najviše ${max} znakova.`);

/** Bosnian is required; English falls back to Bosnian on the site when empty. */
export const localized = (max = 2000) =>
  z.object({
    bs: text(max).min(1, "Obavezno polje (bosanski)."),
    en: text(max).default(""),
  });

export const optionalLocalized = (max = 2000) =>
  z
    .object({ bs: text(max).default(""), en: text(max).default("") })
    // Missing entirely (older saved versions, new fields) = empty.
    .default({ bs: "", en: "" });

const mediaId = z.uuid("Neispravna slika.").nullable().default(null);
const order = z.number().int().min(0).max(9999).default(0);

/* ------------------------------------------------------------------ */

export const tierSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Samo mala slova, brojevi i crtice."),
  label: localized(120),
  price: z.number().min(0).max(100000).nullable().default(null),
  sessionsPerWeek: z.number().int().min(1).max(14).nullable().default(null),
});

export const faqEntrySchema = z.object({
  question: localized(300),
  answer: localized(2000),
});

export const programSchema = z.object({
  name: localized(80),
  shortPitch: localized(300),
  longDescription: localized(2000),
  features: z.array(localized(200)).max(20).default([]),
  imageId: mediaId,
  imageAlt: optionalLocalized(200),
  tiers: z
    .array(tierSchema)
    .min(1, "Program mora imati barem jednu stavku cjenovnika.")
    .refine((tiers) => new Set(tiers.map((t) => t.id)).size === tiers.length, {
      message: "Oznake stavki cjenovnika moraju biti jedinstvene.",
    }),
  faq: z.array(faqEntrySchema).max(20).default([]),
  order,
  visible: z.boolean().default(true),
});

export const teamMemberSchema = z.object({
  name: text(100).min(2, "Unesi ime i prezime."),
  role: localized(80),
  photoId: mediaId,
  /** Shows up in the trainer dropdown on termini. */
  leadsSessions: z.boolean().default(true),
  order,
});

export const partnerSchema = z.object({
  name: text(120).min(2, "Unesi naziv partnera."),
  category: localized(80),
  description: localized(400),
  logoId: mediaId,
  url: z
    .union([z.literal(""), z.url("Unesi ispravan URL (https://…).")])
    .default(""),
  order,
});

export const recoveryServiceSchema = z.object({
  name: localized(80),
  duration: optionalLocalized(60),
  prices: z
    .array(z.object({ label: localized(120), amount: z.number().min(0).max(100000) }))
    .min(1, "Dodaj barem jednu cijenu."),
  benefits: z.array(localized(200)).max(20).default([]),
  order,
});

export const faqItemSchema = faqEntrySchema.extend({ order });

export const terminSchema = z
  .object({
    programKey: text(60).min(1, "Izaberi program."),
    /** Optional group qualifier shown after the program name, e.g. "18+". */
    group: optionalLocalized(40),
    dayOfWeek: z.enum(DAYS, "Izaberi dan."),
    specificDate: z
      .union([z.literal(""), z.iso.date("Neispravan datum.")])
      .nullable()
      .default(null)
      .transform((v) => v || null),
    startTime: z.string().regex(TIME, "Format HH:MM, npr. 18:00"),
    endTime: z.string().regex(TIME, "Format HH:MM, npr. 19:30"),
    trainerId: z
      .union([z.literal(""), z.uuid()])
      .nullable()
      .default(null)
      .transform((v) => v || null),
    maxParticipants: z.number().int().min(1, "Najmanje 1.").max(100),
    status: z.enum(TERMIN_STATUSES).default("Slobodno"),
    note: text(300).default(""),
    colorTag: z.enum(COLOR_TAGS).default("Navy"),
    displayOrder: order,
    featured: z.boolean().default(false),
    active: z.boolean().default(true),
  })
  .superRefine((value, ctx) => {
    if (TIME.test(value.startTime) && TIME.test(value.endTime)) {
      if (toMinutes(value.endTime) <= toMinutes(value.startTime)) {
        ctx.addIssue({
          code: "custom",
          path: ["endTime"],
          message: "Vrijeme završetka mora biti poslije vremena početka.",
        });
      }
    }
    const selfGuided = (SELF_GUIDED_PROGRAMS as readonly string[]).includes(value.programKey);
    if (!selfGuided && !value.trainerId) {
      ctx.addIssue({
        code: "custom",
        path: ["trainerId"],
        message: "Potreban je trener za grupne treninge.",
      });
    }
  });

export const siteSettingsSchema = z
  .object({
    phone: text(40).min(6, "Unesi broj telefona."),
    street: text(120).min(2),
    city: text(80).min(2),
    country: text(80).min(2),
    email: z.union([z.literal(""), z.email("Neispravan email.")]).default(""),
    instagramUrl: z.union([z.literal(""), z.url("Unesi ispravan URL.")]).default(""),
    instagramHandle: text(60).default(""),
    hoursOpens: z.string().regex(TIME, "Format HH:MM"),
    hoursCloses: z.string().regex(TIME, "Format HH:MM"),
    terminiSectionEnabled: z.boolean().default(true),
    showOnlyActiveTermini: z.boolean().default(true),
    commercialGymThreshold: z.number().int().min(1).max(50).default(3),
  });

export type Localized = z.infer<ReturnType<typeof localized>>;
export type ProgramData = z.infer<typeof programSchema>;
export type TierData = z.infer<typeof tierSchema>;
export type TeamMemberData = z.infer<typeof teamMemberSchema>;
export type PartnerData = z.infer<typeof partnerSchema>;
export type RecoveryServiceData = z.infer<typeof recoveryServiceSchema>;
export type FaqItemData = z.infer<typeof faqItemSchema>;
export type TerminData = z.infer<typeof terminSchema>;
export type SiteSettingsData = z.infer<typeof siteSettingsSchema>;

export const CONTENT_SCHEMAS = {
  program: programSchema,
  teamMember: teamMemberSchema,
  partner: partnerSchema,
  recoveryService: recoveryServiceSchema,
  faqItem: faqItemSchema,
  termin: terminSchema,
  siteSettings: siteSettingsSchema,
} as const;

export type ContentType = keyof typeof CONTENT_SCHEMAS;

export interface ContentDataMap {
  program: ProgramData;
  teamMember: TeamMemberData;
  partner: PartnerData;
  recoveryService: RecoveryServiceData;
  faqItem: FaqItemData;
  termin: TerminData;
  siteSettings: SiteSettingsData;
}

/** Cache tag the public site uses for each type. */
export function contentTag(type: ContentType): string {
  return `content:${type}`;
}
