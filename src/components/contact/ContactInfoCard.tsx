import { Clock, MapPin, Phone } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { BUSINESS } from "@/lib/constants";
import { InstagramIcon } from "@/components/ui/InstagramIcon";

interface ContactInfoCardProps {
  locale: Locale;
}

export function ContactInfoCard({ locale }: ContactInfoCardProps) {
  return (
    <div className="clip-corner-lg bg-navy-700 p-7 text-white sm:p-8">
      <h2 className="font-display text-lg uppercase tracking-wide">
        {locale === "bs" ? "Kontakt podaci" : "Contact details"}
      </h2>

      <div className="mt-6 space-y-5 text-sm">
        <a href={BUSINESS.phoneHref} className="flex items-center gap-3 hover:text-accent-500">
          <Phone className="size-5 shrink-0" aria-hidden />
          {BUSINESS.phone}
        </a>

        <p className="flex gap-3">
          <MapPin className="size-5 shrink-0 translate-y-0.5" aria-hidden />
          <span>
            {BUSINESS.address.street}
            <br />
            {BUSINESS.address.city}, {BUSINESS.address.country}
          </span>
        </p>

        <p className="flex items-center gap-3">
          <Clock className="size-5 shrink-0" aria-hidden />
          <span>
            {BUSINESS.hours.opens}–{BUSINESS.hours.closes}{" "}
            <span className="text-white/60">
              ({locale === "bs" ? "svaki dan" : "every day"})
            </span>
          </span>
        </p>

        <a
          href={BUSINESS.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 hover:text-accent-500"
        >
          <InstagramIcon className="size-5 shrink-0" aria-hidden />
          {BUSINESS.instagramHandle}
        </a>
      </div>
    </div>
  );
}
