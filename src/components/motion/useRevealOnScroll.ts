"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

interface RevealOptions {
  threshold?: number;
  rootMargin?: string;
}

/**
 * Dependency-free SUPTILAN scroll-reveal primitive: fires once via
 * IntersectionObserver, skipped entirely under prefers-reduced-motion
 * (content just renders visible immediately — no observer is created).
 */
export function useRevealOnScroll<T extends HTMLElement>({
  threshold = 0.15,
  rootMargin = "0px 0px -10% 0px",
}: RevealOptions = {}) {
  const ref = useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.unobserve(node);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion, threshold, rootMargin]);

  return { ref, isVisible: reducedMotion || isIntersecting };
}
