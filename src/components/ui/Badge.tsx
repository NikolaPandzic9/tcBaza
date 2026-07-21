import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone =
  | "free"
  | "full"
  | "cancelled"
  | "soon"
  | "neutral"
  | "accent";

const TONE_CLASSES: Record<BadgeTone, string> = {
  free: "bg-status-free-bg text-status-free-text",
  full: "bg-status-full-bg text-status-full-text",
  cancelled: "bg-status-cancelled-bg text-status-cancelled-text",
  soon: "bg-status-soon-bg text-status-soon-text",
  neutral: "bg-charcoal-100 text-charcoal-700",
  accent: "bg-navy-700 text-accent-500",
};

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

// Status tones are colored for sighted users but never color-only —
// callers pairing this with a termin status must also pass an icon
// (see StatusBadge) to satisfy WCAG 1.4.1.
export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
