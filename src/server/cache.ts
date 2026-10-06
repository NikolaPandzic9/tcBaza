import { revalidateTag } from "next/cache";

/**
 * Expires the public site's cached data for these tags right away. The ERP
 * and the site share one deployment, so an edit is live on the next page
 * view — no webhook needed. Outside a Next request (seed/migration
 * scripts) there is no cache to expire, so failures are ignored.
 */
export function invalidate(...tags: string[]) {
  for (const tag of new Set(tags)) {
    try {
      revalidateTag(tag, { expire: 0 });
    } catch {
      // Not running inside Next.js (CLI script) — nothing cached to expire.
    }
  }
}
