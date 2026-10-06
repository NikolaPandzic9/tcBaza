import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Info, XCircle } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/* Shared, server-safe building blocks for every ERP screen. */

export const erpButton = {
  base: "clip-corner inline-flex items-center justify-center gap-2 font-display uppercase tracking-wide transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
  size: { md: "px-5 py-2.5 text-sm", sm: "px-3.5 py-1.5 text-xs" },
  variant: {
    primary: "bg-navy-700 text-white hover:bg-navy-900",
    accent: "bg-accent-500 text-navy-950 hover:bg-accent-ink-700 hover:text-white",
    ghost: "bg-white text-navy-700 ring-1 ring-inset ring-charcoal-300 hover:bg-navy-50",
    danger: "bg-white text-status-full-text ring-1 ring-inset ring-status-full-text/40 hover:bg-status-full-bg",
  },
} as const;

export const inputClass =
  "w-full border border-charcoal-300 bg-white px-3 py-2 text-base text-charcoal-900 transition-colors placeholder:text-charcoal-300 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/20 aria-[invalid=true]:border-status-full-text disabled:bg-charcoal-50 sm:text-sm";

export type ErpButtonVariant = keyof typeof erpButton.variant;

export function buttonClass(variant: ErpButtonVariant = "primary", size: "md" | "sm" = "md", extra?: string) {
  return cn(erpButton.base, erpButton.size[size], erpButton.variant[variant], extra);
}

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {back && (
          <Link
            href={back.href}
            className="mb-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-charcoal-500 hover:text-navy-700"
          >
            <ChevronLeft className="size-3.5" aria-hidden />
            {back.label}
          </Link>
        )}
        <h1 className="font-display text-3xl uppercase leading-none tracking-tight text-navy-900 sm:text-4xl">
          {title}
        </h1>
        <span aria-hidden className="clip-corner mt-3 block h-1 w-14 bg-accent-500" />
        {description && <p className="mt-3 max-w-2xl text-sm text-charcoal-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  title,
  actions,
  children,
  className,
  padded = true,
}: {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={cn("clip-corner-lg bg-white shadow-sm ring-1 ring-charcoal-200", className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-charcoal-100 px-5 py-4 sm:px-6">
          {title && (
            <h2 className="font-display text-base uppercase tracking-wide text-navy-900">{title}</h2>
          )}
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={padded ? "p-5 sm:p-6" : undefined}>{children}</div>
    </section>
  );
}

const ALERT = {
  success: { icon: CheckCircle2, cls: "bg-status-free-bg text-status-free-text" },
  error: { icon: XCircle, cls: "bg-status-full-bg text-status-full-text" },
  warning: { icon: AlertTriangle, cls: "bg-status-soon-bg text-status-soon-text" },
  info: { icon: Info, cls: "bg-navy-100 text-navy-900" },
} as const;

export function Alert({
  tone = "info",
  children,
  className,
}: {
  tone?: keyof typeof ALERT;
  children: ReactNode;
  className?: string;
}) {
  const { icon: Icon, cls } = ALERT[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("flex gap-2.5 px-4 py-3 text-sm", cls, className)}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

const PILL = {
  green: "bg-status-free-bg text-status-free-text",
  red: "bg-status-full-bg text-status-full-text",
  amber: "bg-status-soon-bg text-status-soon-text",
  gray: "bg-status-cancelled-bg text-status-cancelled-text",
  navy: "bg-navy-100 text-navy-900",
  lime: "bg-accent-100 text-accent-ink-700",
} as const;

export type PillTone = keyof typeof PILL;

export function Pill({ tone = "gray", children }: { tone?: PillTone; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide", PILL[tone])}>
      {children}
    </span>
  );
}

export function StatTile({
  label,
  value,
  hint,
  href,
  tone = "navy",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  href?: string;
  tone?: "navy" | "lime" | "amber" | "red";
}) {
  const bar = { navy: "bg-navy-700", lime: "bg-accent-500", amber: "bg-status-soon-text", red: "bg-status-full-text" }[tone];
  const body = (
    <>
      <span aria-hidden className={cn("clip-corner block h-1 w-10", bar)} />
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-charcoal-500">{label}</p>
      <p className="mt-1 font-display text-3xl text-navy-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-charcoal-500">{hint}</p>}
    </>
  );
  const cls = "clip-corner-lg block bg-white p-5 shadow-sm ring-1 ring-charcoal-200";
  return href ? (
    <Link href={href} className={cn(cls, "transition-shadow hover:shadow-md")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="px-6 py-14 text-center">
      <p className="font-display text-lg uppercase tracking-wide text-navy-900">{title}</p>
      {children && <div className="mt-2 text-sm text-charcoal-500">{children}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tables, sorting, pagination — all plain links (work without JS)     */
/* ------------------------------------------------------------------ */

export type SearchParams = Record<string, string | string[] | undefined>;

export function param(params: SearchParams, key: string): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value || undefined;
}

export function withParams(basePath: string, params: SearchParams, changes: Record<string, string | number | undefined | null>) {
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const v = Array.isArray(value) ? value[0] : value;
    if (v) next.set(key, v);
  }
  for (const [key, value] of Object.entries(changes)) {
    if (value === undefined || value === null || value === "") next.delete(key);
    else next.set(key, String(value));
  }
  next.delete("ok");
  const qs = next.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export const table = {
  wrap: "overflow-x-auto",
  table: "w-full min-w-[640px] text-left text-sm",
  th: "border-b border-charcoal-200 bg-navy-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-charcoal-500",
  td: "border-b border-charcoal-100 px-4 py-3 align-middle",
  row: "transition-colors hover:bg-navy-50/60",
};

export function SortHeader({
  label,
  field,
  basePath,
  params,
  current,
  dir,
}: {
  label: string;
  field: string;
  basePath: string;
  params: SearchParams;
  current: string;
  dir: "asc" | "desc";
}) {
  const active = current === field;
  const nextDir = active && dir === "asc" ? "desc" : "asc";
  return (
    <th className={table.th} aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : undefined}>
      <Link href={withParams(basePath, params, { sort: field, dir: nextDir, page: null })} className="inline-flex items-center gap-1 hover:text-navy-900">
        {label}
        <span aria-hidden className={cn("text-[0.6rem]", active ? "text-navy-900" : "text-charcoal-300")}>
          {active ? (dir === "asc" ? "▲" : "▼") : "▲▼"}
        </span>
      </Link>
    </th>
  );
}

export function Pagination({
  basePath,
  params,
  page,
  pageCount,
  total,
}: {
  basePath: string;
  params: SearchParams;
  page: number;
  pageCount: number;
  total: number;
}) {
  if (total === 0) return null;
  const link = (p: number, label: ReactNode, disabled: boolean, aria: string) =>
    disabled ? (
      <span className={buttonClass("ghost", "sm", "pointer-events-none opacity-40")} aria-hidden>
        {label}
      </span>
    ) : (
      <Link href={withParams(basePath, params, { page: p })} className={buttonClass("ghost", "sm")} aria-label={aria}>
        {label}
      </Link>
    );
  return (
    <nav aria-label="Stranice" className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs text-charcoal-500">
      <span>
        Ukupno: <strong className="text-navy-900">{total}</strong> · stranica {page} od {pageCount}
      </span>
      <div className="flex gap-2">
        {link(page - 1, <ChevronLeft className="size-4" />, page <= 1, "Prethodna stranica")}
        {link(page + 1, <ChevronRight className="size-4" />, page >= pageCount, "Sljedeća stranica")}
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

const dateFmt = new Intl.DateTimeFormat("bs-BA", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Sarajevo" });
const dateTimeFmt = new Intl.DateTimeFormat("bs-BA", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Sarajevo",
});

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value.length === 10 ? `${value}T12:00:00Z` : value) : value;
  return dateFmt.format(date);
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "—";
  return dateTimeFmt.format(typeof value === "string" ? new Date(value) : value);
}

export function formatKM(amount: number) {
  return `${amount.toLocaleString("bs-BA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KM`;
}
