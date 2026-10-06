"use client";

import { CheckCircle2, Loader2, Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type ComponentProps, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/cn";
import { buttonClass, inputClass, type ErpButtonVariant } from "./ui";

// Defined in ui.tsx (server-safe); re-exported for client components.
export { inputClass } from "./ui";

/** Submit button that shows progress while its form's action runs. */
export function SubmitButton({
  children,
  variant = "primary",
  size = "md",
  className,
  pendingLabel = "Čuvam…",
  ...props
}: ComponentProps<"button"> & { variant?: ErpButtonVariant; size?: "md" | "sm"; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || props.disabled} className={buttonClass(variant, size, className)} {...props}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/** Destructive submit — asks first. */
export function ConfirmSubmit({
  message,
  children,
  variant = "danger",
  size = "sm",
  className,
  ...props
}: ComponentProps<"button"> & { message: string; variant?: ErpButtonVariant; size?: "md" | "sm" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      className={buttonClass(variant, size, className)}
      {...props}
    >
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : children}
    </button>
  );
}

/** Label + control + hint + error, wired with ids for screen readers. */
export function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wide text-navy-900">
        {label}
        {required && <span className="text-status-full-text"> *</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-charcoal-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs font-medium text-status-full-text">
          {error}
        </p>
      )}
    </div>
  );
}

/** Debounced search box that writes ?q= into the URL (server does the filtering). */
export function SearchInput({ placeholder = "Pretraži…", param = "q" }: { placeholder?: string; param?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get(param) ?? "");
  const [pending, startTransition] = useTransition();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const next = new URLSearchParams(searchParams.toString());
      if (value.trim()) next.set(param, value.trim());
      else next.delete(param);
      next.delete("page");
      next.delete("ok");
      startTransition(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`));
    }, 300);
    return () => clearTimeout(timer);
    // searchParams intentionally omitted: only typing should trigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative w-full sm:w-72">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-charcoal-500" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(inputClass, "pl-9")}
      />
      {pending && <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-charcoal-500" aria-hidden />}
    </div>
  );
}

/** <select> that writes its value into the URL. */
export function FilterSelect({
  param,
  label,
  options,
  allLabel = "Sve",
}: {
  param: string;
  label: string;
  options: { value: string; label: string }[];
  allLabel?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  return (
    <select
      aria-label={label}
      value={searchParams.get(param) ?? ""}
      onChange={(e) => {
        const next = new URLSearchParams(searchParams.toString());
        if (e.target.value) next.set(param, e.target.value);
        else next.delete(param);
        next.delete("page");
        next.delete("ok");
        startTransition(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`));
      }}
      className={cn(inputClass, "w-auto min-w-36 py-2")}
    >
      <option value="">
        {label}: {allLabel}
      </option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

const FLASH: Record<string, string> = {
  created: "Kreirano.",
  saved: "Sačuvano.",
  published: "Objavljeno — izmjena je vidljiva na sajtu.",
  unpublished: "Povučeno s objave.",
  discarded: "Neobjavljene izmjene su odbačene.",
  restored: "Verzija je vraćena u nacrt. Objavi je da bude vidljiva na sajtu.",
  trashed: "Premješteno u otpad.",
  untrashed: "Vraćeno iz otpada.",
  purged: "Trajno obrisano.",
  deleted: "Obrisano.",
  password: "Lozinka je promijenjena.",
  sessions: "Ostale sesije su odjavljene.",
};

/** Shows the "?ok=…" confirmation left by a redirecting action, then
 * removes it from the URL so a reload doesn't show it again. */
export function FlashMessage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const key = searchParams.get("ok");
  const [visible, setVisible] = useState<string | null>(null);
  const [seenKey, setSeenKey] = useState<string | null>(null);

  // Adopt a new ?ok= during render (not in an effect); reset once it's
  // gone from the URL so the same confirmation can show again later.
  if (key !== seenKey) {
    setSeenKey(key);
    if (key) setVisible(FLASH[key] ?? "Gotovo.");
  }

  useEffect(() => {
    if (!key) return;
    const next = new URLSearchParams(searchParams.toString());
    next.delete("ok");
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  }, [key, pathname, router, searchParams]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(null), 5000);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;
  return (
    <div
      role="status"
      className="fixed bottom-4 right-4 z-50 flex max-w-sm items-start gap-2.5 bg-navy-950 px-4 py-3 text-sm text-white shadow-lg clip-corner"
    >
      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent-500" aria-hidden />
      <span>{visible}</span>
      <button type="button" onClick={() => setVisible(null)} aria-label="Zatvori" className="ml-2 text-white/60 hover:text-white">
        <X className="size-4" />
      </button>
    </div>
  );
}
