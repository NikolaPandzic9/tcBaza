import type { SiteInfo } from "@/lib/siteInfo";

interface MapEmbedProps {
  title: string;
  info: SiteInfo;
}

// No-API-key embed (maps.google.com/maps?q=...&output=embed) — avoids
// requiring a billing-enabled Google Cloud project for a small-business
// site. Trade-off: less styling control than the JS Maps API.
export function MapEmbed({ title, info }: MapEmbedProps) {
  const query = encodeURIComponent(
    `${info.address.street}, ${info.address.city}, ${info.address.country}`,
  );

  return (
    <div className="clip-corner-lg aspect-[4/3] w-full overflow-hidden bg-navy-100 sm:aspect-video">
      <iframe
        src={`https://maps.google.com/maps?q=${query}&z=15&output=embed`}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-full w-full border-0"
      />
    </div>
  );
}
