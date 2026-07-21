"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Bosnian, Croatian, and Serbian standard forms are mutually intelligible
 * and this site's bs content already reads naturally in all three — there
 * is no real text to duplicate. Visitors still expect to see their own
 * language named explicitly (common BiH-market convention), so this tracks
 * which label is showing as "selected" for display purposes only. It is
 * intentionally decoupled from next-intl's actual locale (which stays
 * "bs" for all three) — switching between them never changes a single
 * word of content.
 */
export type LanguageVariant = "bos" | "hrv" | "srp";

const STORAGE_KEY = "baza-lang-variant";
const CHANGE_EVENT = "baza-lang-variant-change";

function isVariant(value: string | null): value is LanguageVariant {
  return value === "bos" || value === "hrv" || value === "srp";
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function getSnapshot(): LanguageVariant {
  const value = window.localStorage.getItem(STORAGE_KEY);
  return isVariant(value) ? value : "bos";
}

function getServerSnapshot(): LanguageVariant {
  return "bos";
}

export function useLanguageVariant() {
  const variant = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setVariant = useCallback((next: LanguageVariant) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { variant, setVariant };
}
