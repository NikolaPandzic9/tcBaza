"use client";

import { Loader2, UserPlus } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { inputClass } from "@/components/erp/client";
import { Alert, buttonClass } from "@/components/erp/ui";
import { enrollAction, searchEnrollableMembers } from "./actions";

type Candidate = Awaited<ReturnType<typeof searchEnrollableMembers>>[number];

/** Type-ahead search for active members who aren't on this termin yet. */
export function EnrollMember({ terminId, full }: { terminId: string; full: boolean }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Candidate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searching, startSearch] = useTransition();
  const [saving, startSave] = useTransition();

  useEffect(() => {
    const timer = setTimeout(() => {
      startSearch(async () => setResults(q.trim().length >= 2 ? await searchEnrollableMembers(terminId, q) : []));
    }, 250);
    return () => clearTimeout(timer);
  }, [q, terminId]);

  if (full) {
    return <Alert tone="warning">Termin je popunjen. Ispiši nekoga ili povećaj maksimalan broj učesnika.</Alert>;
  }

  return (
    <div className="space-y-3">
      <label htmlFor="enroll-search" className="block text-xs font-semibold uppercase tracking-wide text-navy-900">
        Upiši člana
      </label>
      <div className="relative">
        <input
          id="enroll-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ime i prezime (najmanje 2 slova)…"
          autoComplete="off"
          className={inputClass}
        />
        {searching && <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-charcoal-500" aria-hidden />}
      </div>
      {error && <Alert tone="error">{error}</Alert>}
      {results.length > 0 && (
        <ul className="divide-y divide-charcoal-100 border border-charcoal-200">
          {results.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <span>
                <span className="font-semibold text-navy-900">
                  {m.firstName} {m.lastName}
                </span>
                {m.phone && <span className="ml-2 text-xs text-charcoal-500">{m.phone}</span>}
              </span>
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  startSave(async () => {
                    setError(null);
                    const result = await enrollAction(terminId, m.id);
                    if (result.error) setError(result.error);
                    else {
                      setQ("");
                      setResults([]);
                    }
                  })
                }
                className={buttonClass("accent", "sm")}
              >
                <UserPlus className="size-3.5" aria-hidden />
                Upiši
              </button>
            </li>
          ))}
        </ul>
      )}
      {q.trim().length >= 2 && !searching && results.length === 0 && (
        <p className="text-xs text-charcoal-500">Nema aktivnih članova s tim imenom koji već nisu na terminu.</p>
      )}
    </div>
  );
}
