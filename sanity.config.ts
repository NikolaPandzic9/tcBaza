import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId, sanityIsConfigured } from "./src/sanity/env";
import { schema } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";

export default defineConfig({
  basePath: "/studio",
  // Same placeholder-until-configured guard as src/sanity/client.ts —
  // keeps the Studio route buildable before a real project ID exists.
  projectId: sanityIsConfigured ? projectId : "placeholder",
  dataset,
  schema,
  plugins: [
    structureTool({ structure }),
    // GROQ playground for developers only — not linked from the pinned
    // desk structure the client sees.
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
