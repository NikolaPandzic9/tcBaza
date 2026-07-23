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

/**
 * Picks the single longest (most specific) NAV_LINKS href matching the
 * current pathname — needed because "/rezervacija-termina" would
 * otherwise also prefix-match its own child route
 * "/rezervacija-termina/komercijalna-teretana", highlighting both.
 */
function getActiveNavHref(pathname: string): Pathnames | null {
  let best: Pathnames | null = null;
  for (const link of NAV_LINKS) {
    const matches =
      link.href === "/" ? pathname === "/" : pathname === link.href || pathname.startsWith(`${link.href}/`);
    if (matches && (best === null || link.href.length > best.length)) {
      best = link.href;
    }
  }
  return best;
}

export function isNavLinkActive(pathname: string, href: Pathnames): boolean {
  return getActiveNavHref(pathname) === href;
}
