"use client";

import {
  Activity,
  CalendarClock,
  Dumbbell,
  ExternalLink,
  HandHelping,
  HeartPulse,
  Images,
  Inbox,
  LayoutDashboard,
  Menu,
  MessageCircleQuestion,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const ICONS = {
  dashboard: LayoutDashboard,
  termini: CalendarClock,
  clanovi: Users,
  uplate: Wallet,
  upiti: Inbox,
  programi: Dumbbell,
  tim: UserCog,
  oporavak: HeartPulse,
  partneri: HandHelping,
  faq: MessageCircleQuestion,
  mediji: Images,
  podesavanja: Settings,
  korisnici: ShieldCheck,
  aktivnost: Activity,
} satisfies Record<string, LucideIcon>;

export interface NavItem {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
  badge?: number;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function Nav({ sections, onNavigate }: { sections: NavSection[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="ERP navigacija" className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
      {sections.map((section, i) => (
        <div key={section.title ?? i}>
          {section.title && (
            <p className="px-3 pb-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/40">{section.title}</p>
          )}
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = ICONS[item.icon];
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-3 px-3 py-2 text-sm font-semibold transition-colors",
                      active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    {active && <span aria-hidden className="absolute inset-y-1 left-0 w-1 bg-accent-500" />}
                    <Icon className={cn("size-4 shrink-0", active ? "text-accent-500" : "text-white/50")} aria-hidden />
                    <span className="flex-1">{item.label}</span>
                    {item.badge ? (
                      <span className="min-w-5 bg-accent-500 px-1.5 text-center text-[0.65rem] font-bold text-navy-950">{item.badge}</span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function ErpShell({
  sections,
  user,
  siteUrl,
  logout,
  children,
}: {
  sections: NavSection[];
  user: { displayName: string; roleLabel: string };
  siteUrl: string;
  logout: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer on navigation and on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const brand = (
    <Link href="/" className="flex items-center gap-3 px-6 py-5" onClick={() => setOpen(false)}>
      <Image src="/brand/logo-mark-white.png" alt="Trening centar Baza" width={738} height={418} className="h-8 w-auto" priority />
      <span className="font-display text-xs uppercase tracking-[0.3em] text-accent-500">ERP</span>
    </Link>
  );

  const footer = (
    <div className="border-t border-white/10 px-4 py-4">
      <Link
        href="/profil"
        onClick={() => setOpen(false)}
        className={cn(
          "flex items-center gap-3 px-2 py-2 transition-colors hover:bg-white/5",
          pathname === "/profil" && "bg-white/10",
        )}
      >
        <span className="flex size-9 shrink-0 items-center justify-center bg-accent-500 font-display text-sm text-navy-950 clip-corner">
          {user.displayName.slice(0, 1).toUpperCase()}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-white">{user.displayName}</span>
          <span className="block text-xs text-white/50">{user.roleLabel}</span>
        </span>
      </Link>
      <div className="mt-2 flex items-center justify-between gap-2 px-2">
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white"
        >
          <ExternalLink className="size-3.5" aria-hidden />
          Otvori sajt
        </a>
        {logout}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-full">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-navy-950 lg:flex">
        {brand}
        <Nav sections={sections} />
        {footer}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Meni">
          <div aria-hidden className="absolute inset-0 bg-charcoal-950/60" onClick={() => setOpen(false)} />
          <aside className="relative flex h-full w-72 max-w-[85%] flex-col bg-navy-950">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Zatvori meni"
              className="absolute right-3 top-4 p-2 text-white/70 hover:text-white"
            >
              <X className="size-5" />
            </button>
            {brand}
            <Nav sections={sections} onNavigate={() => setOpen(false)} />
            {footer}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between bg-navy-950 px-4 lg:hidden">
          <button type="button" onClick={() => setOpen(true)} aria-label="Otvori meni" aria-expanded={open} className="p-2 text-white">
            <Menu className="size-5" />
          </button>
          <Image src="/brand/logo-mark-white.png" alt="Trening centar Baza" width={738} height={418} className="h-7 w-auto" />
          <span className="w-9" />
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
