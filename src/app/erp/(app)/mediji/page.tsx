import type { Metadata } from "next";
import Link from "next/link";
import { FilterSelect, SearchInput, SubmitButton } from "@/components/erp/client";
import { MediaThumb } from "@/components/erp/MediaPicker";
import { Card, EmptyState, PageHeader, Pagination, Pill, formatDateTime, inputClass, param, withParams, type SearchParams } from "@/components/erp/ui";
import { cn } from "@/lib/cn";
import { requireUser } from "@/server/auth/current";
import { CONTENT_META } from "@/server/content/registry";
import type { ContentType } from "@/server/content/schemas";
import { getDb } from "@/server/db/client";
import { findMediaUsages, getMediaByIds, listMedia } from "@/server/media/media";
import { CONTENT_ROUTES } from "../_content/config";
import { deleteMediaAction, updateAltAction } from "./actions";
import { DeleteMediaButton, MediaUploader } from "./MediaUploader";

export const metadata: Metadata = { title: "Mediji" };

const kb = (bytes: number) => (bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`);

export default async function MediaPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireUser("media.manage");
  const params = await searchParams;
  const db = getDb();
  const kind = param(params, "kind") as "image" | "document" | undefined;
  const selectedId = param(params, "selected");
  const result = await listMedia(db, {
    q: param(params, "q"),
    kind: kind === "image" || kind === "document" ? kind : undefined,
    sort: param(params, "sort") as "newest" | "oldest" | "name" | "size" | undefined,
    page: Number(param(params, "page") ?? 1) || 1,
  });

  const selected = selectedId && /^[0-9a-f-]{36}$/.test(selectedId) ? (await getMediaByIds(db, [selectedId])).get(selectedId) : undefined;
  const usages = selected ? await findMediaUsages(db, selected.id) : [];

  return (
    <>
      <PageHeader title="Mediji" description="Sve slike i dokumenti koje sajt koristi. Ugrađene slike sajta su označene i ne mogu se brisati." />
      <div className="mb-6">
        <MediaUploader />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card padded={false}>
          <div className="flex flex-wrap items-center gap-3 border-b border-charcoal-100 px-4 py-3">
            <SearchInput placeholder="Naziv ili opis…" />
            <FilterSelect param="kind" label="Vrsta" options={[{ value: "image", label: "Slike" }, { value: "document", label: "Dokumenti" }]} />
            <FilterSelect
              param="sort"
              label="Redoslijed"
              allLabel="Najnovije"
              options={[
                { value: "oldest", label: "Najstarije" },
                { value: "name", label: "Po nazivu" },
                { value: "size", label: "Po veličini" },
              ]}
            />
          </div>
          {result.items.length === 0 ? (
            <EmptyState title="Nema fajlova" />
          ) : (
            <ul className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
              {result.items.map((m) => (
                <li key={m.id}>
                  <Link
                    href={withParams("/mediji", params, { selected: m.id })}
                    scroll={false}
                    aria-current={m.id === selected?.id ? "true" : undefined}
                    className={cn(
                      "group block bg-white ring-1 ring-charcoal-200 transition hover:ring-2 hover:ring-navy-700",
                      m.id === selected?.id && "ring-2 ring-navy-700",
                    )}
                  >
                    <MediaThumb item={m} className="aspect-square w-full" />
                    <span className="block truncate px-2 py-1.5 text-xs text-charcoal-700">{m.filename}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Pagination basePath="/mediji" params={params} page={result.page} pageCount={result.pageCount} total={result.total} />
        </Card>

        <aside>
          {selected ? (
            <Card title="Detalji" className="xl:sticky xl:top-6">
              <MediaThumb item={selected} className="aspect-video w-full bg-navy-50 object-contain" />
              <dl className="mt-4 space-y-1.5 text-xs">
                <div className="flex justify-between gap-2"><dt className="text-charcoal-500">Naziv</dt><dd className="truncate text-right">{selected.filename}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-charcoal-500">Veličina</dt><dd>{kb(selected.size)}{selected.width ? ` · ${selected.width}×${selected.height}` : ""}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-charcoal-500">Dodano</dt><dd>{formatDateTime(selected.createdAt)}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-charcoal-500">Izvor</dt><dd>{selected.storageKey.startsWith("static:") ? <Pill tone="navy">Ugrađena</Pill> : <Pill tone="lime">Otpremljena</Pill>}</dd></div>
              </dl>
              <a href={selected.url} target="_blank" rel="noopener noreferrer" className="mt-2 block truncate text-xs text-navy-700 underline">
                {selected.url}
              </a>

              <form action={updateAltAction.bind(null, selected.id)} className="mt-5 space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wide text-navy-900">
                  Opis slike (BS)
                  <input name="altBs" defaultValue={selected.alt.bs} maxLength={200} className={`${inputClass} mt-1`} />
                </label>
                <label className="block text-xs font-semibold uppercase tracking-wide text-navy-900">
                  Opis slike (EN)
                  <input name="altEn" defaultValue={selected.alt.en} maxLength={200} className={`${inputClass} mt-1`} />
                </label>
                <SubmitButton size="sm" className="w-full">Sačuvaj opis</SubmitButton>
              </form>

              <div className="mt-5 border-t border-charcoal-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-navy-900">Koristi se u</p>
                {usages.length === 0 ? (
                  <p className="mt-1 text-xs text-charcoal-500">Nigdje — može se obrisati.</p>
                ) : (
                  <ul className="mt-1 space-y-1 text-xs">
                    {usages.map((u) => (
                      <li key={u.id}>
                        <Link href={`${CONTENT_ROUTES[u.type as ContentType]}/${u.id}`} className="text-navy-700 underline">
                          {CONTENT_META[u.type as ContentType].label}: {CONTENT_META[u.type as ContentType].title(u.draft as never)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {!selected.storageKey.startsWith("static:") && usages.length === 0 && (
                <div className="mt-4">
                  <DeleteMediaButton action={deleteMediaAction.bind(null, selected.id)} />
                </div>
              )}
            </Card>
          ) : (
            <Card>
              <p className="text-sm text-charcoal-500">Klikni na fajl za detalje, opis (alt tekst) i informaciju gdje se koristi.</p>
            </Card>
          )}
        </aside>
      </div>
    </>
  );
}
