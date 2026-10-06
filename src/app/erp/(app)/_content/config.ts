import type { Permission } from "@/server/auth/permissions";
import type { ContentType } from "@/server/content/schemas";

/** Where each content type lives in the ERP, and who may touch it. */
export const CONTENT_ROUTES: Record<ContentType, string> = {
  termin: "/termini",
  program: "/programi",
  teamMember: "/tim",
  partner: "/partneri",
  recoveryService: "/oporavak",
  faqItem: "/faq",
  siteSettings: "/podesavanja",
};

type Operation = "view" | "edit" | "publish" | "delete";

export function contentPermission(type: ContentType, op: Operation): Permission {
  if (type === "termin") {
    return op === "view" ? "termini.view" : op === "publish" ? "termini.publish" : "termini.edit";
  }
  if (type === "siteSettings") return "settings.edit";
  return op === "publish" ? "content.publish" : op === "delete" ? "content.delete" : "content.edit";
}

export const STATUS_LABELS = {
  draft: { label: "Nacrt", tone: "gray" },
  published: { label: "Objavljeno", tone: "green" },
  changed: { label: "Neobjavljene izmjene", tone: "amber" },
} as const;

export const VERSION_EVENT_LABELS: Record<string, string> = {
  create: "Kreirano",
  create_publish: "Kreirano i objavljeno",
  save: "Sačuvan nacrt",
  publish: "Objavljeno",
  restore: "Vraćena ranija verzija",
  discard: "Odbačene izmjene",
};
