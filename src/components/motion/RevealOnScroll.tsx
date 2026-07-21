"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useRevealOnScroll } from "./useRevealOnScroll";

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  /** Stagger children reveals by offsetting each item's transition. */
  delayMs?: number;
}

// 8px translate + 150-400ms ease-out, transform/opacity only — matches
// the site-wide SUPTILAN scroll profile everywhere but the hero/quiz.
export function RevealOnScroll({
  children,
  className,
  delayMs = 0,
}: RevealOnScrollProps) {
  const { ref, isVisible } = useRevealOnScroll<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={cn(
        "transition-[opacity,transform] duration-300 ease-out",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        className,
      )}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
