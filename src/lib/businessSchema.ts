import { BUSINESS, SITE_URL } from "./constants";

/**
 * HealthClub (a schema.org LocalBusiness subtype) rather than a bare
 * LocalBusiness — a closer match for coached group training + recovery
 * services. Every field here is real client data; nothing invented
 * (no openingHours, no AggregateRating — see PODACI KOJI NEDOSTAJU).
 */
export function getHealthClubSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "HealthClub",
    name: BUSINESS.name,
    url: SITE_URL,
    telephone: BUSINESS.phone,
    priceRange: "50-200 KM",
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.address.street,
      addressLocality: BUSINESS.address.city,
      addressCountry: BUSINESS.address.countryCode,
    },
    sameAs: [BUSINESS.instagramUrl],
  };
}
