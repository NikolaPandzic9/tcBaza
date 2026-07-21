import { Anton, Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-body" });

/**
 * Root-level safety net — not-found.tsx nested under app/[locale]/ only
 * catches 404s inside an already-resolved locale segment (an explicit
 * notFound() call, a missing dynamic param). A URL that matches no
 * route pattern at all bypasses that segment entirely and lands here,
 * outside any locale context, so this can't use next-intl translations.
 */
export default function RootNotFound() {
  return (
    <html lang="bs" className={`${anton.variable} ${jakarta.variable} h-full`}>
      <body className="flex h-full min-h-screen flex-col items-center justify-center bg-navy-950 px-6 text-center text-white">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-accent-500">
          Greška 404
        </p>
        <h1 className="mt-4 font-display text-4xl uppercase sm:text-5xl">
          Ovdje nema treninga.
        </h1>
        <p className="mt-4 max-w-md text-white/70">
          Stranica koju tražiš je premještena, obrisana ili nikad nije ni postojala.
        </p>
        <Link
          href="/"
          className="clip-corner mt-8 inline-block bg-accent-500 px-6 py-3 font-display text-sm uppercase tracking-wide text-navy-950 transition-colors hover:bg-white"
        >
          Nazad na početnu
        </Link>
      </body>
    </html>
  );
}
