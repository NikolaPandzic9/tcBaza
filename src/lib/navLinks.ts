import type { Pathnames } from "@/i18n/routing";

export type NavMessageKey =
  | "home"
  | "about"
  | "services"
  | "pricing"
  | "pricingShort"
  | "team"
  | "schedule"
  | "contact"
  | "partners";

interface NavLink {
  href: Pathnames;
  messageKey: NavMessageKey;
  /** Tighter label for the desktop nav row, which is the tightest on
   * space; the footer and mobile menu have room for the full word. */
  shortMessageKey?: NavMessageKey;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/", messageKey: "home" },
  { href: "/o-nama", messageKey: "about" },
  { href: "/usluge", messageKey: "services" },
  { href: "/clanarine-i-cijene", messageKey: "pricing", shortMessageKey: "pricingShort" },
  { href: "/nas-tim", messageKey: "team" },
  { href: "/rezervacija-termina", messageKey: "schedule" },
  { href: "/partneri", messageKey: "partners" },
  { href: "/kontakt", messageKey: "contact" },
];

/** "/usluge" also matches "/usluge/kik-boks" etc.; "/" only matches itself. */
export function isNavLinkActive(pathname: string, href: Pathnames): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
