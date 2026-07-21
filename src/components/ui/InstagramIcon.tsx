import type { SVGProps } from "react";

// lucide-react dropped brand/social icons — this is a minimal
// hand-drawn glyph matching lucide's stroke conventions (24x24,
// currentColor, strokeWidth 2) so it sits visually consistent with the
// rest of the icon set (Phone, MapPin, Menu, ...).
export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
