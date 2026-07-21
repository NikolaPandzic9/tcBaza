import { cn } from "@/lib/cn";

interface AngledDividerProps {
  className?: string;
  /** Flips the slope direction — use where two angled dividers should
   * form a consistent visual rhythm (e.g. alternating sections). */
  flip?: boolean;
}

// The site's one recurring structural motif: every section boundary gets
// this sheared edge instead of a straight line, echoing the logo's
// diagonal-cut letterforms. Color the wedge via a bg-* class matching
// the section it introduces.
export function AngledDivider({ className, flip = false }: AngledDividerProps) {
  return (
    <div
      aria-hidden
      className={cn("h-10 w-full sm:h-14", className)}
      style={{
        clipPath: flip
          ? "polygon(0 0, 100% 100%, 0 100%)"
          : "polygon(0 100%, 100% 0, 100% 100%)",
      }}
    />
  );
}
