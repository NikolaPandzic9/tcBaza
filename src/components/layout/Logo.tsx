import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { BUSINESS } from "@/lib/constants";
import { cn } from "@/lib/cn";

interface LogoProps {
  variant?: "white" | "navy";
  className?: string;
}

const SOURCES = {
  white: "/brand/logo-mark-white.png",
  navy: "/brand/logo-mark-navy-transparent.png",
} as const;

export function Logo({ variant = "white", className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-500",
        className,
      )}
      aria-label={BUSINESS.name}
    >
      <Image
        src={SOURCES[variant]}
        alt={BUSINESS.name}
        width={738}
        height={418}
        priority
        className="h-9 w-auto sm:h-11"
      />
    </Link>
  );
}
