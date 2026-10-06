import Image from "next/image";
import type { ReactNode } from "react";
import { VertebraeDivider } from "@/components/ui/VertebraeDivider";

/** Full-screen navy backdrop with the brand mark — login and access-denied screens. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <main className="relative flex min-h-full items-center justify-center overflow-hidden bg-navy-950 px-4 py-12">
      <VertebraeDivider className="pointer-events-none absolute inset-x-0 top-1/2 h-24 w-full -translate-y-1/2 text-white/5" />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image src="/brand/logo-mark-white.png" alt="Trening centar Baza" width={738} height={418} priority className="h-14 w-auto" />
          <p className="mt-4 font-display text-xs uppercase tracking-[0.35em] text-accent-500">ERP</p>
        </div>
        <div className="clip-corner-lg bg-white p-7 shadow-2xl sm:p-8">
          <h1 className="font-display text-2xl uppercase tracking-tight text-navy-900">{title}</h1>
          <span aria-hidden className="clip-corner mt-3 block h-1 w-12 bg-accent-500" />
          {subtitle && <p className="mt-3 text-sm text-charcoal-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        <p className="mt-6 text-center text-xs text-white/40">Zaštićeni pristup · sve aktivnosti se bilježe</p>
      </div>
    </main>
  );
}
