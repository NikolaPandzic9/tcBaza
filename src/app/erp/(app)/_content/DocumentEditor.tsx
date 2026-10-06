"use client";

import { ArrowDown, ArrowUp, Plus, Save, Send, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { MediaField } from "@/components/erp/MediaPicker";
import { Field, inputClass } from "@/components/erp/client";
import { Alert, buttonClass } from "@/components/erp/ui";
import type { MediaItem } from "@/app/erp/(app)/mediji/actions";
import { cn } from "@/lib/cn";
import type { ContentType } from "@/server/content/schemas";
import { saveDocumentAction } from "./actions";
import { EDITOR_SECTIONS, type FieldDef, type Option } from "./fields";

type Data = Record<string, unknown>;
type Path = (string | number)[];

function getIn(obj: unknown, path: Path): unknown {
  return path.reduce<unknown>((acc, key) => (acc == null ? undefined : (acc as Record<string | number, unknown>)[key]), obj);
}

function setIn<T>(obj: T, path: Path, value: unknown): T {
  if (path.length === 0) return value as T;
  const [head, ...rest] = path;
  const source = (obj ?? (typeof head === "number" ? [] : {})) as Record<string | number, unknown>;
  const copy = (Array.isArray(source) ? [...source] : { ...source }) as Record<string | number, unknown>;
  copy[head] = setIn(source[head], rest, value);
  return copy as T;
}

const idFor = (path: Path) => `f-${path.join("-")}`;
const keyFor = (path: Path) => path.join(".");

interface EditorProps {
  type: ContentType;
  id: string | null;
  initialData: Data;
  version: number;
  basePath: string;
  options: { programs: Option[]; trainers: Option[] };
  mediaPreviews: Record<string, MediaItem>;
  canPublish: boolean;
  /** Singletons/new docs land back on the same URL after saving. */
  afterCreatePath?: (id: string) => string;
}

export function DocumentEditor({
  type,
  id,
  initialData,
  version: initialVersion,
  basePath,
  options,
  mediaPreviews: initialPreviews,
  canPublish,
}: EditorProps) {
  const router = useRouter();
  const [data, setData] = useState<Data>(initialData);
  const [version, setVersion] = useState(initialVersion);
  const [previews, setPreviews] = useState(initialPreviews);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [dirty, setDirty] = useState(false);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Server sent fresh data (after save + refresh) — adopt it.
  const [lastInitial, setLastInitial] = useState(initialData);
  if (initialData !== lastInitial) {
    setLastInitial(initialData);
    setData(initialData);
    setVersion(initialVersion);
    setDirty(false);
  }

  const update = useCallback((path: Path, value: unknown) => {
    setData((prev) => setIn(prev, path, value));
    setDirty(true);
    setSavedNote(null);
  }, []);

  const save = useCallback(
    (publish: boolean) => {
      setFormError(null);
      startTransition(async () => {
        const result = await saveDocumentAction({ type, id, data, expectedVersion: id ? version : undefined, publish });
        if (!result.ok) {
          setErrors(result.fieldErrors ?? {});
          setFormError(result.error ?? "Čuvanje nije uspjelo.");
          return;
        }
        setErrors({});
        setWarnings(result.warnings);
        setDirty(false);
        setVersion(result.version);
        if (!id) router.push(`${basePath}/${result.id}?ok=${publish ? "published" : "created"}`);
        else setSavedNote(result.published ? "Objavljeno — vidljivo na sajtu." : "Nacrt sačuvan (nije još na sajtu).");
      });
    },
    [type, id, data, version, basePath, router],
  );

  // Warn before leaving with unsaved edits; Ctrl/Cmd+S saves a draft.
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!pending) save(false);
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("keydown", onKey);
    };
  }, [dirty, pending, save]);

  const ctx: RenderCtx = { data, errors, options, previews, update, setPreviews };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save(false);
      }}
      className="space-y-5"
      noValidate
    >
      {formError && <Alert tone="error">{formError}</Alert>}
      {warnings.length > 0 && (
        <Alert tone="warning">
          <ul className="space-y-1">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </Alert>
      )}

      {EDITOR_SECTIONS[type].map((section) => (
        <section key={section.title} className="clip-corner-lg bg-white shadow-sm ring-1 ring-charcoal-200">
          <header className="border-b border-charcoal-100 px-5 py-4 sm:px-6">
            <h2 className="font-display text-base uppercase tracking-wide text-navy-900">{section.title}</h2>
            {section.description && <p className="mt-1 text-xs text-charcoal-500">{section.description}</p>}
          </header>
          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            {section.fields.map((field) => (
              <FieldRenderer key={field.name} field={field} path={[field.name]} ctx={ctx} />
            ))}
          </div>
        </section>
      ))}

      {/* Sticky action bar — always reachable on long forms and on phones. */}
      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-end gap-2 border-t border-charcoal-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <span className="mr-auto text-xs text-charcoal-500" aria-live="polite">
          {pending
            ? "Čuvam…"
            : dirty
              ? "Nesačuvane izmjene"
              : savedNote
                ? `✓ ${savedNote}`
                : id
                  ? `Verzija ${version}`
                  : "Novi zapis"}
        </span>
        <button type="submit" disabled={pending} className={buttonClass("ghost")}>
          <Save className="size-4" aria-hidden />
          Sačuvaj nacrt
        </button>
        {canPublish && (
          <button type="button" disabled={pending} onClick={() => save(true)} className={buttonClass("accent")}>
            <Send className="size-4" aria-hidden />
            Sačuvaj i objavi
          </button>
        )}
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Field rendering                                                     */
/* ------------------------------------------------------------------ */

interface RenderCtx {
  data: Data;
  errors: Record<string, string>;
  options: { programs: Option[]; trainers: Option[] };
  previews: Record<string, MediaItem>;
  update: (path: Path, value: unknown) => void;
  setPreviews: React.Dispatch<React.SetStateAction<Record<string, MediaItem>>>;
}

const wide = (field: FieldDef) =>
  field.kind === "list" ||
  field.kind === "localizedList" ||
  field.kind === "media" ||
  field.kind === "textarea" ||
  (field.kind === "localized" && field.multiline) ||
  field.kind === "localized";

function errorFor(ctx: RenderCtx, path: Path): string | undefined {
  const key = keyFor(path);
  return ctx.errors[key] ?? ctx.errors[`${key}.bs`];
}

function FieldRenderer({ field, path, ctx }: { field: FieldDef; path: Path; ctx: RenderCtx }) {
  const value = getIn(ctx.data, path);
  const id = idFor(path);
  const error = errorFor(ctx, path);
  const described = error ? `${id}-error` : "hint" in field && field.hint ? `${id}-hint` : undefined;
  const common = { id, "aria-invalid": Boolean(error) || undefined, "aria-describedby": described };
  const required = "required" in field ? field.required : undefined;
  const span = wide(field) ? "sm:col-span-2" : undefined;
  const hint = "hint" in field ? field.hint : undefined;

  switch (field.kind) {
    case "text":
      return (
        <Field id={id} label={field.label} hint={hint} error={error} required={required} className={span}>
          <input
            {...common}
            type={field.inputMode === "email" ? "email" : field.inputMode === "url" ? "url" : "text"}
            inputMode={field.inputMode}
            value={(value as string) ?? ""}
            maxLength={field.maxLength}
            placeholder={field.placeholder}
            onChange={(e) => ctx.update(path, e.target.value)}
            className={inputClass}
          />
        </Field>
      );
    case "textarea":
      return (
        <Field id={id} label={field.label} hint={hint} error={error} className={span}>
          <textarea
            {...common}
            rows={field.rows ?? 3}
            maxLength={field.maxLength}
            value={(value as string) ?? ""}
            onChange={(e) => ctx.update(path, e.target.value)}
            className={inputClass}
          />
        </Field>
      );
    case "localized":
      return <LocalizedField field={field} path={path} ctx={ctx} className={span} />;
    case "number":
      return (
        <Field id={id} label={field.label} hint={hint} error={error} required={required} className={span}>
          <div className="flex items-center">
            <input
              {...common}
              type="number"
              inputMode="decimal"
              min={field.min}
              max={field.max}
              step={field.step ?? 1}
              value={value === null || value === undefined ? "" : String(value)}
              onChange={(e) => {
                const raw = e.target.value;
                ctx.update(path, raw === "" ? (field.nullable ? null : 0) : Number(raw));
              }}
              className={inputClass}
            />
            {field.suffix && <span className="ml-2 whitespace-nowrap text-xs text-charcoal-500">{field.suffix}</span>}
          </div>
        </Field>
      );
    case "boolean":
      return (
        <div className={cn("sm:col-span-2", "flex items-start gap-3")}>
          <input
            id={id}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => ctx.update(path, e.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-navy-700"
          />
          <label htmlFor={id} className="text-sm">
            <span className="font-semibold text-navy-900">{field.label}</span>
            {hint && <span className="block text-xs text-charcoal-500">{hint}</span>}
          </label>
        </div>
      );
    case "select": {
      const options = field.options === "programs" ? ctx.options.programs : field.options === "trainers" ? ctx.options.trainers : field.options;
      return (
        <Field id={id} label={field.label} hint={hint} error={error} required={required} className={span}>
          <select
            {...common}
            value={(value as string) ?? ""}
            onChange={(e) => ctx.update(path, e.target.value === "" && field.nullable ? null : e.target.value)}
            className={inputClass}
          >
            {(field.nullable || field.options === "programs") && <option value="">— Izaberi —</option>}
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      );
    }
    case "time":
      return (
        <Field id={id} label={field.label} error={error} required={required} className={span}>
          <input {...common} type="time" value={(value as string) ?? ""} onChange={(e) => ctx.update(path, e.target.value)} className={inputClass} />
        </Field>
      );
    case "date":
      return (
        <Field id={id} label={field.label} hint={hint} error={error} className={span}>
          <input
            {...common}
            type="date"
            value={(value as string) ?? ""}
            onChange={(e) => ctx.update(path, e.target.value || null)}
            className={inputClass}
          />
        </Field>
      );
    case "media":
      return (
        <Field id={id} label={field.label} hint={hint} error={error} className={span}>
          <MediaField
            id={id}
            value={(value as string | null) ?? null}
            preview={value ? ctx.previews[value as string] : undefined}
            invalid={Boolean(error)}
            onChange={(next, item) => {
              if (item) ctx.setPreviews((p) => ({ ...p, [item.id]: item }));
              ctx.update(path, next);
            }}
          />
        </Field>
      );
    case "localizedList":
      return <LocalizedListField field={field} path={path} ctx={ctx} />;
    case "list":
      return <ListField field={field} path={path} ctx={ctx} />;
  }
}

function LocalizedField({
  field,
  path,
  ctx,
  className,
}: {
  field: Extract<FieldDef, { kind: "localized" }>;
  path: Path;
  ctx: RenderCtx;
  className?: string;
}) {
  const value = (getIn(ctx.data, path) as { bs?: string; en?: string }) ?? {};
  const errorBs = ctx.errors[keyFor([...path, "bs"])] ?? ctx.errors[keyFor(path)];
  const errorEn = ctx.errors[keyFor([...path, "en"])];
  const Control = field.multiline ? "textarea" : "input";
  return (
    <fieldset className={className}>
      <legend className="block text-xs font-semibold uppercase tracking-wide text-navy-900">
        {field.label}
        {field.required && <span className="text-status-full-text"> *</span>}
      </legend>
      <div className="mt-1.5 grid gap-2 md:grid-cols-2">
        {(["bs", "en"] as const).map((lang) => {
          const id = idFor([...path, lang]);
          const err = lang === "bs" ? errorBs : errorEn;
          return (
            <div key={lang}>
              <div className="flex items-stretch">
                <label
                  htmlFor={id}
                  className="flex w-10 shrink-0 items-start justify-center border border-r-0 border-charcoal-300 bg-navy-50 pt-2 text-[0.65rem] font-bold uppercase text-charcoal-500"
                  title={lang === "bs" ? "Bosanski" : "Engleski (prazno = koristi se bosanski)"}
                >
                  {lang}
                </label>
                <Control
                  id={id}
                  rows={field.multiline ? (field.rows ?? 3) : undefined}
                  maxLength={field.maxLength}
                  value={value[lang] ?? ""}
                  placeholder={lang === "en" ? "Prazno = prikazuje se bosanski tekst" : undefined}
                  aria-invalid={Boolean(err) || undefined}
                  aria-describedby={err ? `${id}-error` : undefined}
                  onChange={(e) => ctx.update([...path, lang], e.target.value)}
                  className={inputClass}
                />
              </div>
              {err && (
                <p id={`${id}-error`} className="mt-1 text-xs font-medium text-status-full-text">
                  {err}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {field.hint && <p className="mt-1 text-xs text-charcoal-500">{field.hint}</p>}
    </fieldset>
  );
}

function ListControls({ index, length, onMove, onRemove, label }: { index: number; length: number; onMove: (to: number) => void; onRemove: () => void; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={() => onMove(index - 1)} disabled={index === 0} aria-label={`Pomjeri gore: ${label}`} className="p-1.5 text-charcoal-500 hover:text-navy-900 disabled:opacity-30">
        <ArrowUp className="size-4" />
      </button>
      <button type="button" onClick={() => onMove(index + 1)} disabled={index === length - 1} aria-label={`Pomjeri dole: ${label}`} className="p-1.5 text-charcoal-500 hover:text-navy-900 disabled:opacity-30">
        <ArrowDown className="size-4" />
      </button>
      <button type="button" onClick={onRemove} aria-label={`Ukloni: ${label}`} className="p-1.5 text-charcoal-500 hover:text-status-full-text">
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

function move<T>(list: T[], from: number, to: number): T[] {
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

function LocalizedListField({ field, path, ctx }: { field: Extract<FieldDef, { kind: "localizedList" }>; path: Path; ctx: RenderCtx }) {
  const items = (getIn(ctx.data, path) as { bs: string; en: string }[]) ?? [];
  return (
    <div className="space-y-3 sm:col-span-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-navy-900">{field.label}</p>
      {items.length === 0 && <p className="text-sm text-charcoal-500">Nema stavki.</p>}
      {items.map((_, index) => (
        <div key={index} className="flex items-start gap-2">
          <div className="flex-1">
            <LocalizedField field={{ kind: "localized", name: String(index), label: `${index + 1}.`, maxLength: 200 }} path={[...path, index]} ctx={ctx} />
          </div>
          <div className="pt-6">
            <ListControls
              index={index}
              length={items.length}
              label={`stavka ${index + 1}`}
              onMove={(to) => ctx.update(path, move(items, index, to))}
              onRemove={() => ctx.update(path, items.filter((__, i) => i !== index))}
            />
          </div>
        </div>
      ))}
      {(!field.max || items.length < field.max) && (
        <button type="button" onClick={() => ctx.update(path, [...items, { bs: "", en: "" }])} className={buttonClass("ghost", "sm")}>
          <Plus className="size-4" aria-hidden />
          {field.addLabel}
        </button>
      )}
    </div>
  );
}

function ListField({ field, path, ctx }: { field: Extract<FieldDef, { kind: "list" }>; path: Path; ctx: RenderCtx }) {
  const items = (getIn(ctx.data, path) as Data[]) ?? [];
  const listError = ctx.errors[keyFor(path)];
  return (
    <div className="space-y-3 sm:col-span-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-navy-900">{field.label}</p>
      {field.hint && <p className="text-xs text-charcoal-500">{field.hint}</p>}
      {listError && <p className="text-xs font-medium text-status-full-text">{listError}</p>}
      {items.map((_, index) => (
        <div key={index} className="border border-charcoal-200 bg-navy-50/50">
          <div className="flex items-center justify-between border-b border-charcoal-200 px-4 py-2">
            <span className="font-display text-sm uppercase tracking-wide text-navy-900">
              {field.itemLabel} {index + 1}
            </span>
            <ListControls
              index={index}
              length={items.length}
              label={`${field.itemLabel} ${index + 1}`}
              onMove={(to) => ctx.update(path, move(items, index, to))}
              onRemove={() => ctx.update(path, items.filter((__, i) => i !== index))}
            />
          </div>
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            {field.fields.map((sub) => (
              <FieldRenderer key={sub.name} field={sub} path={[...path, index, sub.name]} ctx={ctx} />
            ))}
          </div>
        </div>
      ))}
      {(!field.max || items.length < field.max) && (
        <button type="button" onClick={() => ctx.update(path, [...items, field.newItem()])} className={buttonClass("ghost", "sm")}>
          <Plus className="size-4" aria-hidden />
          {field.addLabel}
        </button>
      )}
    </div>
  );
}
