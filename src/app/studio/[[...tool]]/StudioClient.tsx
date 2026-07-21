"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

// Isolated behind "use client" on purpose: sanity.config.ts transitively
// pulls in Sanity Studio's UI internals, and bundling those through the
// Server Component (react-server) module graph breaks on a swr export
// condition mismatch. Importing it only from a client module keeps it on
// the client graph, where it resolves correctly.
export function StudioClient() {
  return <NextStudio config={config} />;
}
