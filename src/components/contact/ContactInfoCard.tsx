import { Clock, MapPin, Navigation, Phone } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import type { SiteInfo } from "@/lib/siteInfo";
import { InstagramIcon } from "@/components/ui/InstagramIcon";

interface ContactInfoCardProps {
  locale: Locale;
  info: SiteInfo;
}

export function ContactInfoCard({ locale, info }: ContactInfoCardProps) {
  return (
    <div className="clip-corner-lg bg-navy-700 p-7 text-white sm:p-8">
      <h2 className="font-display text-lg uppercase tracking-wide">
        {locale === "bs" ? "Kontakt podaci" : "Contact details"}
      </h2>

      <div className="mt-6 space-y-5 text-sm">
        <a href={info.phoneHref} className="flex items-center gap-3 hover:text-accent-500">
          <Phone className="size-5 shrink-0" aria-hidden />
          {info.phone}
        </a>

        <address className="flex gap-3 not-italic">
          <MapPin className="size-5 shrink-0 translate-y-0.5" aria-hidden />
          <span>
            {info.address.street}
            <br />
            {info.address.city}, {info.address.country}
            <a
              href={info.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent-500 hover:text-white"
            >
              <Navigation className="size-3.5" aria-hidden />
              {locale === "bs" ? "Otvori u mapama" : "Open in Maps"}
            </a>
          </span>
        </address>

        <p className="flex items-center gap-3">
          <Clock className="size-5 shrink-0" aria-hidden />
          <span>
            {info.hours.opens}–{info.hours.closes}{" "}
            <span className="text-white/60">
              ({locale === "bs" ? "svaki dan" : "every day"})
            </span>
          </span>
        </p>

        <a
          href={info.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 hover:text-accent-500"
        >
          <InstagramIcon className="size-5 shrink-0" aria-hidden />
          {info.instagramHandle}
        </a>
      </div>
    </div>
  );
}
