/**
 * Single source of truth for the client's real business data (NAP, socials).
 * Referenced by the header/footer, contact page, and JSON-LD — keeping it
 * in one place is what keeps the name/address/phone identical everywhere,
 * which matters for local SEO.
 */
export const BUSINESS = {
  name: "Trening centar Baza",
  legalSlogan: "ZBOG SEBE",
  subSlogan: "Treniraj pametno. Napreduj sigurno.",
  foundedYear: 2026,
  phone: "+387 66 788 876",
  phoneHref: "tel:+38766788876",
  address: {
    street: "Jovana Dučića 84",
    city: "Istočno Sarajevo",
    country: "Bosna i Hercegovina",
    countryCode: "BA",
  },
  instagramUrl: "https://www.instagram.com/tc.baza",
  instagramHandle: "@tc.baza",
  // Not provided by the client — deliberately left unset rather than
  // invented. Guard with these booleans instead of empty-string checks.
  email: undefined as string | undefined,
  facebookUrl: undefined as string | undefined,
  tiktokUrl: undefined as string | undefined,
} as const;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.tcbaza.ba";
