import type { ReactNode } from "react";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { cn } from "@/lib/cn";

interface PageHeaderProps {
  eyebrow: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}

/**
 * Shared subpage title block: eyebrow, oversized display headline, a
 * clipped accent bar for extra emphasis, and an optional lede. Used by
 * every subpage that isn't a two-column hero (those bump title size
 * inline instead, since the surrounding layout differs too much to share).
 */
export function PageHeader({ eyebrow, title, description, className }: PageHeaderProps) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <SectionEyebrow>{eyebrow}</SectionEyebrow>
      <h1 className="mt-5 font-display text-4xl uppercase leading-[0.95] tracking-tight text-navy-900 sm:text-5xl lg:text-6xl">
        {title}
      </h1>
      <span aria-hidden className="clip-corner mt-5 block h-1.5 w-20 bg-accent-500" />
      {description && <p className="mt-6 text-lg text-charcoal-500">{description}</p>}
    </div>
  );
}
