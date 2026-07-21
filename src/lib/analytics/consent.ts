"use client";

import { useCallback, useSyncExternalStore } from "react";

export type ConsentStatus = "unknown" | "granted" | "denied";

const STORAGE_KEY = "baza-analytics-consent";
const CHANGE_EVENT = "baza-consent-change";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function getSnapshot(): ConsentStatus {
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "granted" || value === "denied" ? value : "unknown";
}

function getServerSnapshot(): ConsentStatus {
  return "unknown";
}

export function useConsent() {
  const status = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setConsent = useCallback((next: "granted" | "denied") => {
    window.localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return {
    status,
    grant: () => setConsent("granted"),
    deny: () => setConsent("denied"),
  };
}
