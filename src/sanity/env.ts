/**
 * Sanity connection settings. The client provides these via env vars once
 * they create a Sanity project (see HANDOVER.md) — until then the project
 * ID is empty and `sanityIsConfigured` is false, which the data-fetching
 * helpers in `src/sanity/queries.ts` use to fail soft instead of breaking
 * the build.
 */
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-01-01";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";

export const sanityIsConfigured = projectId.length > 0;
