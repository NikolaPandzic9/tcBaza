"use client";

import { FileText, ImagePlus, Loader2, Upload, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { pickerListMedia, uploadMediaAction, type MediaItem } from "@/app/erp/(app)/mediji/actions";
import { cn } from "@/lib/cn";
import { inputClass } from "./client";
import { prepareUpload } from "./resizeImage";
import { buttonClass } from "./ui";

/** Uploads one file (resized in the browser first). Shared by the picker
 * and the media library page. */
export async function uploadFile(file: File, alt?: { bs: string; en: string }) {
  const prepared = await prepareUpload(file);
  const form = new FormData();
  form.set("file", prepared);
  if (alt) {
    form.set("altBs", alt.bs);
    form.set("altEn", alt.en);
  }
  return uploadMediaAction(form);
}

export function MediaThumb({ item, className }: { item: Pick<MediaItem, "url" | "kind" | "filename" | "alt">; className?: string }) {
  if (item.kind === "document") {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-1 bg-navy-50 p-2 text-center", className)}>
        <FileText className="size-6 text-navy-700" aria-hidden />
        <span className="line-clamp-2 text-[0.65rem] text-charcoal-500">{item.filename}</span>
      </div>
    );
  }
  return (
    // Thumbnails of arbitrary uploads (Blob or local) — plain <img> keeps
    // the picker independent of next/image remote-pattern config.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.url}
      alt={item.alt.bs || item.filename}
      loading="lazy"
      // Logos (SVG) must not be cropped; photos fill the tile.
      className={cn(item.url.endsWith(".svg") ? "bg-white object-contain p-2" : "object-cover", className)}
    />
  );
}

export function MediaPickerDialog({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (item: MediaItem) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: MediaItem[]; pageCount: number } | null>(null);
  const [loading, startLoading] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback((query: string, p: number) => {
    startLoading(async () => {
      const result = await pickerListMedia({ q: query, page: p, kind: "image" });
      setData({ items: result.items, pageCount: result.pageCount });
    });
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      load("", 1);
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => load(q, page), 250);
    return () => clearTimeout(timer);
  }, [q, page, open, load]);

  async function handleUpload(file: File) {
    setError(null);
    setUploading(true);
    const result = await uploadFile(file);
    setUploading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSelect(result.item);
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-label="Izbor slike"
      className="m-auto w-[min(56rem,calc(100%-2rem))] bg-transparent p-0 backdrop:bg-charcoal-950/60"
    >
      <div className="clip-corner-lg bg-white">
        <header className="flex items-center justify-between gap-3 border-b border-charcoal-100 px-5 py-4">
          <h2 className="font-display text-lg uppercase tracking-wide text-navy-900">Izaberi sliku</h2>
          <button type="button" onClick={onClose} aria-label="Zatvori" className="p-1 text-charcoal-500 hover:text-navy-900">
            <X className="size-5" />
          </button>
        </header>

        <div className="flex flex-wrap items-center gap-3 px-5 py-4">
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Pretraži po nazivu ili opisu…"
            aria-label="Pretraži medije"
            className={cn(inputClass, "flex-1")}
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/heic"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleUpload(file);
              e.target.value = "";
            }}
          />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className={buttonClass("accent")}>
            {uploading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Upload className="size-4" aria-hidden />}
            {uploading ? "Otpremam…" : "Otpremi novu"}
          </button>
        </div>
        {error && <p className="px-5 pb-3 text-sm text-status-full-text">{error}</p>}

        <div className="max-h-[55vh] overflow-y-auto px-5 pb-5">
          {loading && !data ? (
            <div className="flex justify-center py-16">
              <Loader2 className="size-6 animate-spin text-charcoal-500" aria-label="Učitavam" />
            </div>
          ) : data && data.items.length > 0 ? (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {data.items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className="group block w-full text-left"
                  >
                    <MediaThumb item={item} className="aspect-square w-full ring-1 ring-charcoal-200 transition group-hover:ring-2 group-hover:ring-navy-700" />
                    <span className="mt-1 block truncate text-xs text-charcoal-500">{item.filename}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-12 text-center text-sm text-charcoal-500">Nema slika{q ? " za ovu pretragu" : ""}. Otpremi novu.</p>
          )}
        </div>

        {data && data.pageCount > 1 && (
          <footer className="flex items-center justify-end gap-2 border-t border-charcoal-100 px-5 py-3 text-xs text-charcoal-500">
            <span>
              {page} / {data.pageCount}
            </span>
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className={buttonClass("ghost", "sm")}>
              Prethodna
            </button>
            <button type="button" disabled={page >= data.pageCount} onClick={() => setPage((p) => p + 1)} className={buttonClass("ghost", "sm")}>
              Sljedeća
            </button>
          </footer>
        )}
      </div>
    </dialog>
  );
}

/** Form control: current image preview + choose/replace/remove. */
export function MediaField({
  id,
  value,
  preview,
  onChange,
  invalid,
}: {
  id: string;
  value: string | null;
  preview: MediaItem | undefined;
  onChange: (id: string | null, item?: MediaItem) => void;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div id={id} className={cn("flex flex-wrap items-center gap-4", invalid && "ring-1 ring-status-full-text")}>
      <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden bg-navy-50 ring-1 ring-charcoal-200">
        {value && preview ? (
          <MediaThumb item={preview} className="size-full" />
        ) : value ? (
          <span className="px-2 text-center text-[0.65rem] text-charcoal-500">Slika izabrana</span>
        ) : (
          <ImagePlus className="size-6 text-charcoal-300" aria-hidden />
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setOpen(true)} className={buttonClass("ghost", "sm")}>
          {value ? "Zamijeni" : "Izaberi sliku"}
        </button>
        {value && (
          <button type="button" onClick={() => onChange(null)} className={buttonClass("danger", "sm")}>
            Ukloni
          </button>
        )}
      </div>
      <MediaPickerDialog open={open} onClose={() => setOpen(false)} onSelect={(item) => onChange(item.id, item)} />
    </div>
  );
}
