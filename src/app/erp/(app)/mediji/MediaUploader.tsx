"use client";

import { Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { uploadFile } from "@/components/erp/MediaPicker";
import { cn } from "@/lib/cn";

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/gif,image/heic,application/pdf,.docx,.xlsx";

/** Drop zone + file picker; uploads sequentially and reports per file. */
export function MediaUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ name: string; error?: string }[]>([]);

  async function handle(files: FileList | File[]) {
    const list = Array.from(files).slice(0, 20);
    if (list.length === 0) return;
    const results: { name: string; error?: string }[] = [];
    for (const [i, file] of list.entries()) {
      setBusy(`${i + 1}/${list.length}: ${file.name}`);
      const result = await uploadFile(file);
      results.push({ name: file.name, error: result.ok ? undefined : result.error });
    }
    setBusy(null);
    setMessages(results);
    router.refresh();
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handle(e.dataTransfer.files);
        }}
        className={cn(
          "clip-corner-lg flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed px-6 py-8 text-center transition-colors",
          dragging ? "border-navy-700 bg-navy-100" : "border-charcoal-300 bg-white hover:border-navy-500",
        )}
      >
        {busy ? <Loader2 className="size-7 animate-spin text-navy-700" aria-hidden /> : <Upload className="size-7 text-navy-700" aria-hidden />}
        <p className="font-display text-sm uppercase tracking-wide text-navy-900">{busy ? `Otpremam ${busy}` : "Prevuci fajlove ovdje ili klikni"}</p>
        <p className="text-xs text-charcoal-500">
          Slike (JPG, PNG, WebP, AVIF, GIF, HEIC) se automatski optimizuju u WebP do 2400 px. Dokumenti: PDF, DOCX, XLSX do 4 MB.
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) void handle(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {messages.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs" aria-live="polite">
          {messages.map((m, i) => (
            <li key={i} className={m.error ? "text-status-full-text" : "text-status-free-text"}>
              {m.name}: {m.error ?? "otpremljeno"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function DeleteMediaButton({ action }: { action: () => Promise<{ error?: string }> }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          if (!window.confirm("Trajno obrisati ovaj fajl?")) return;
          setPending(true);
          const result = await action();
          setPending(false);
          if (result?.error) setError(result.error);
        }}
        className="clip-corner inline-flex w-full items-center justify-center gap-2 bg-white px-3.5 py-1.5 font-display text-xs uppercase tracking-wide text-status-full-text ring-1 ring-inset ring-status-full-text/40 hover:bg-status-full-bg disabled:opacity-50"
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        Obriši fajl
      </button>
      {error && <p className="mt-2 text-xs text-status-full-text">{error}</p>}
    </div>
  );
}
