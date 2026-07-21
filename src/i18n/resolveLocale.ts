import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing, type Locale } from "./routing";

/**
 * Next's generated route types constrain a dynamic segment's params to
 * `string` (it can't infer our locale union from a folder name), so every
 * [locale] layout/page receives `Promise<{ locale: string }>` and narrows
 * it here — 404s on anything outside routing.locales instead of silently
 * falling back, and hands back our real `Locale` type for the rest of the
 * render (setRequestLocale, <html lang>, etc.).
 */
export async function resolveLocale(
  params: Promise<{ locale: string }>,
): Promise<Locale> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return locale;
}
