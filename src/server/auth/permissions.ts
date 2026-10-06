import type { UserRole } from "../db/schema";

/**
 * Role → permission map. One table instead of role checks sprinkled
 * through the UI, so "what can a trener do?" has a single answer.
 */
export const PERMISSIONS = {
  "dashboard.view": ["admin", "urednik", "trener"],
  "termini.view": ["admin", "urednik", "trener"],
  "termini.edit": ["admin", "urednik"],
  "termini.publish": ["admin", "urednik"],
  "enrollments.manage": ["admin", "urednik", "trener"],
  "content.edit": ["admin", "urednik"],
  "content.publish": ["admin", "urednik"],
  "content.delete": ["admin", "urednik"],
  "content.purge": ["admin"],
  "media.manage": ["admin", "urednik"],
  "members.view": ["admin", "urednik", "trener"],
  "members.edit": ["admin", "urednik"],
  "payments.manage": ["admin", "urednik"],
  "inquiries.manage": ["admin", "urednik"],
  "settings.edit": ["admin"],
  "users.manage": ["admin"],
  "audit.view": ["admin"],
} as const satisfies Record<string, readonly UserRole[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: UserRole, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly UserRole[]).includes(role);
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  urednik: "Urednik",
  trener: "Trener",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: "Sve, uključujući korisnike, podešavanja i zapisnik aktivnosti.",
  urednik: "Sadržaj sajta, termini, mediji, članovi, uplate i upiti.",
  trener: "Pregled termina i članova, upis članova na termine.",
};
