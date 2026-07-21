"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { useMediaQuery } from "@/components/motion/useMediaQuery";
import { useReducedMotion } from "@/components/motion/useReducedMotion";

interface AboutParallaxImageProps {
  alt: string;
}

// Second of the two parallax spots allowed by the design profile (the
// hero uses the first) — same 20px cap, same md+/reduced-motion guards.
export function AboutParallaxImage({ alt }: AboutParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const enabled = isDesktop && !reducedMotion;
  const y = useTransform(scrollYProgress, [0, 1], enabled ? [-20, 20] : [0, 0]);

  return (
    <div ref={containerRef} className="relative aspect-[4/5] w-full clip-corner-lg overflow-hidden bg-navy-900">
      <motion.div className="absolute inset-0" style={{ y }}>
        <Image
          src="/photos/about-gym-mural.jpg"
          alt={alt}
          fill
          sizes="(min-width: 1024px) 42vw, 90vw"
          className="scale-110 object-cover"
        />
      </motion.div>
    </div>
  );
}
