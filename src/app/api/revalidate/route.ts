import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Called by a Sanity webhook on publish (configured in the Sanity project
 * dashboard, see HANDOVER.md) so termin/settings edits show up without
 * waiting for the 300s ISR window. Guarded by a shared secret rather than
 * a signature library — proportionate for a low-traffic single-tenant site.
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret");
  const expected = process.env.SANITY_REVALIDATE_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ message: "Neautorizovano." }, { status: 401 });
  }

  let type: string | undefined;
  try {
    const body = (await request.json()) as { _type?: string };
    type = body._type;
  } catch {
    // No/invalid body — fall back to revalidating everything below.
  }

  // Next 16 requires a cache-life profile alongside the tag even for
  // classic fetch-tag invalidation; "minutes" mirrors the 300s window
  // used by the `next: { revalidate: 300 }` fetches in queries.ts.
  if (type === "termin" || !type) revalidateTag("termini", "minutes");
  if (type === "siteSettings" || !type) revalidateTag("siteSettings", "minutes");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
