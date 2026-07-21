import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SectionEyebrowProps {
  children: ReactNode;
  className?: string;
  tone?: "onLight" | "onDark";
}

// Lifted straight from the "— ZBOG SEBE —" tagline lockup in the real
// logo — used as the label on every major section for a consistent,
// brand-authentic rhythm instead of a generic kicker style.
export function SectionEyebrow({
  children,
  className,
  tone = "onLight",
}: SectionEyebrowProps) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 font-display text-xs uppercase tracking-[0.3em]",
        tone === "onLight" ? "text-accent-ink-700" : "text-accent-500",
        className,
      )}
    >
      <span aria-hidden className="h-px w-6 bg-current" />
      {children}
      <span aria-hidden className="h-px w-6 bg-current" />
    </p>
  );
}
