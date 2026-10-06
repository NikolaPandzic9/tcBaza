/**
 * Brand constants that never change from the ERP. Contact details (phone,
 * address, hours, Instagram) are edited in the ERP under "Podešavanja" and
 * reach the site through SiteInfo (src/lib/siteInfo.ts).
 */
export const BUSINESS = {
  name: "Trening centar Baza",
  legalSlogan: "ZBOG SEBE",
  subSlogan: "Treniraj pametno. Napreduj sigurno.",
  foundedYear: 2026,
  countryCode: "BA",
} as const;

/**
 * The original contact details — imported into the ERP on first run and
 * used by the site whenever no database is configured.
 */
export const DEFAULT_CONTACT = {
  phone: "+387 66 788 876",
  street: "Jovana Dučića 84",
  city: "Istočno Sarajevo",
  country: "Bosna i Hercegovina",
  instagramUrl: "https://www.instagram.com/tc.baza",
  instagramHandle: "@tc.baza",
  hours: { opens: "05:00", closes: "01:00" },
} as const;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.tcbaza.ba";

/**
 * Where members realistically travel from (client-confirmed). Used for
 * JSON-LD areaServed and the visible "where we are" copy, so the two
 * always say the same thing.
 */
export const SERVICE_AREAS = [
  "Istočno Sarajevo",
  "Lukavica",
  "Istočna Ilidža",
  "Istočno Novo Sarajevo",
  "Sarajevo",
  "Ilidža",
  "Pale",
  "Sokolac",
  "Trnovo",
] as const;
