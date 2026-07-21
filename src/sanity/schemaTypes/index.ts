import type { SchemaTypeDefinition } from "sanity";
import { siteSettingsType } from "./siteSettings";
import { terminType } from "./termin";
import { trainerType } from "./trainer";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [terminType, trainerType, siteSettingsType],
};
