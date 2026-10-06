import { BUSINESS, DEFAULT_CONTACT } from "./constants";

/**
 * Contact details as the site renders them — built from the ERP's
 * "Podešavanja" document. Plain data (no functions), so it can be passed
 * from server to client components.
 */
export interface SiteInfo {
  phone: string;
  phoneHref: string;
  whatsappNumber: string;
  email: string | null;
  address: { street: string; city: string; country: string; countryCode: string };
  instagramUrl: string;
  instagramHandle: string;
  hours: { opens: string; closes: string };
  mapsUrl: string;
}

export function buildSiteInfo(input: {
  phone: string;
  street: string;
  city: string;
  country: string;
  email?: string | null;
  instagramUrl: string;
  instagramHandle: string;
  hoursOpens: string;
  hoursCloses: string;
}): SiteInfo {
  const digits = input.phone.replace(/\D/g, "");
  return {
    phone: input.phone,
    phoneHref: `tel:+${digits}`,
    // wa.me wants the number with no "+" and no spaces.
    whatsappNumber: digits,
    email: input.email || null,
    address: {
      street: input.street,
      city: input.city,
      country: input.country,
      countryCode: BUSINESS.countryCode,
    },
    instagramUrl: input.instagramUrl,
    instagramHandle: input.instagramHandle,
    hours: { opens: input.hoursOpens, closes: input.hoursCloses },
    // Google Maps search for the exact address — opens the native Maps app
    // on phones, which is what a "get directions" tap should do.
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${BUSINESS.name}, ${input.street}, ${input.city}`,
    )}`,
  };
}

export const DEFAULT_SITE_INFO = buildSiteInfo({
  phone: DEFAULT_CONTACT.phone,
  street: DEFAULT_CONTACT.street,
  city: DEFAULT_CONTACT.city,
  country: DEFAULT_CONTACT.country,
  instagramUrl: DEFAULT_CONTACT.instagramUrl,
  instagramHandle: DEFAULT_CONTACT.instagramHandle,
  hoursOpens: DEFAULT_CONTACT.hours.opens,
  hoursCloses: DEFAULT_CONTACT.hours.closes,
});

const WHATSAPP_PREFILL = {
  bs: "Zanima me termin za: ",
  en: "I'm interested in a session for: ",
};

/** WhatsApp chat with a prefilled opener, so the first message already
 * says what the visitor wants. */
export function getWhatsAppUrl(info: SiteInfo, locale: "bs" | "en"): string {
  return `https://wa.me/${info.whatsappNumber}?text=${encodeURIComponent(WHATSAPP_PREFILL[locale])}`;
}
