/**
 * Plain constants, deliberately NOT in Button.tsx: that file is "use
 * client", and a Server Component importing a plain value (not a
 * component) from a client-boundary module gets an unresolved reference
 * instead of the real string — it renders as `class=""` with no error.
 * Keeping these here lets Server Components (ProgramDetailTemplate, the
 * hero) use them directly.
 */
export type ButtonVariant = "primary" | "secondary" | "ghost";

export const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary: "bg-navy-700 text-white hover:bg-navy-900",
  secondary:
    "bg-accent-500 text-navy-950 hover:bg-accent-ink-700 hover:text-white",
  ghost:
    "bg-transparent text-navy-700 ring-1 ring-inset ring-navy-300 hover:bg-navy-100",
};

export const buttonBaseClasses =
  "clip-corner inline-flex items-center justify-center gap-2 px-6 py-3 font-display text-sm uppercase tracking-wide transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50";
