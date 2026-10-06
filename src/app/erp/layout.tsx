import type { Metadata, Viewport } from "next";
import { Anton, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import "../globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "TC Baza ERP", template: "%s · TC Baza ERP" },
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: "#0f1e3d",
};

// Every ERP page depends on the signed-in user — never prerendered.
export const dynamic = "force-dynamic";

export default function ErpRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bs" className={`${anton.variable} ${jakarta.variable} h-full`}>
      <body className="h-full bg-navy-50 font-body text-charcoal-700 antialiased">{children}</body>
    </html>
  );
}
