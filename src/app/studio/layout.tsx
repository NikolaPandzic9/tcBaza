import type { Metadata } from "next";
import type { ReactNode } from "react";

// Sibling "root layout" to app/[locale]/layout.tsx (Next.js supports
// multiple root layouts side by side) — the Studio is an internal admin
// tool, not part of the localized public site, so it gets its own
// unstyled <html>/<body> and is excluded from search indexing.
export const metadata: Metadata = {
  title: "Baza — Studio",
  robots: { index: false, follow: false },
};

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
