import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, sanityIsConfigured } from "./env";

export const client = createClient({
  // next-sanity validates projectId at construction time, before
  // queries.ts's sanityIsConfigured guard ever runs — a placeholder here
  // keeps the client constructible pre-launch; it's never actually
  // queried until a real project ID is set.
  projectId: sanityIsConfigured ? projectId : "placeholder",
  dataset,
  apiVersion,
  // Termini are public read data — the CDN cache keeps the schedule fast;
  // pages that need instant admin edits opt out per-query with a fetch tag.
  useCdn: true,
  stega: false,
});
