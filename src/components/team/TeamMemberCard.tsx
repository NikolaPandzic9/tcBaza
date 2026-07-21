"use client";

import { UserRound } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { Locale } from "@/i18n/routing";
import type { TeamMember } from "@/content/team";
import { cn } from "@/lib/cn";

interface TeamMemberCardProps {
  member: TeamMember;
  locale: Locale;
}

// Photos aren't links (no bio pages exist yet), so the "click" half of
// the brief is a tap-to-toggle button — it mirrors the hover reveal for
// touch devices, which don't get a real :hover state.
export function TeamMemberCard({ member, locale }: TeamMemberCardProps) {
  const [active, setActive] = useState(false);

  return (
    <div className="group clip-corner-lg overflow-hidden bg-white shadow-sm ring-1 ring-charcoal-200 transition-shadow hover:shadow-lg">
      <button
        type="button"
        onClick={() => setActive((current) => !current)}
        aria-pressed={active}
        aria-label={member.name}
        className="relative block aspect-[4/5] w-full overflow-hidden bg-navy-100 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
      >
        {member.photo ? (
          <Image
            src={member.photo}
            alt={member.name}
            fill
            sizes="(min-width: 1024px) 22vw, 45vw"
            className={cn(
              "object-cover transition-transform duration-500 ease-out group-hover:scale-110 group-focus-visible:scale-110",
              active && "scale-110",
            )}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-navy-700">
            <UserRound className="size-16 text-white/30" aria-hidden />
          </div>
        )}

        <div
          aria-hidden
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100",
            active && "opacity-100",
          )}
        />
        <span
          aria-hidden
          className={cn(
            "clip-corner absolute right-3 top-3 h-2.5 w-2.5 bg-accent-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100",
            active && "opacity-100",
          )}
        />
      </button>
      <div className="p-4">
        <p className="font-display text-base uppercase tracking-wide text-navy-900">
          {member.name}
        </p>
        <p className="mt-0.5 text-sm text-charcoal-500">{member.role[locale]}</p>
      </div>
    </div>
  );
}
