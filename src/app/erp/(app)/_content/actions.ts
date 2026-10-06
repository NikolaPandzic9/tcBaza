"use server";

import { and, eq, isNull, ne, sql } from "drizzle-orm";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import type { ZodError } from "zod";
import { actorFor, requireUser } from "@/server/auth/current";
import {
  ConflictError,
  NotFoundError,
  createDocument,
  discardChanges,
  getDocument,
  publishDocument,
  purgeDocument,
  restoreFromTrash,
  restoreVersion,
  saveDraft,
  trashDocument,
  unpublishDocument,
} from "@/server/content/documents";
import { CONTENT_META } from "@/server/content/registry";
import { CONTENT_SCHEMAS, type ContentDataMap, type ContentType, type TerminData } from "@/server/content/schemas";
import { getDb } from "@/server/db/client";
import { contentDocuments } from "@/server/db/schema";
import { CONTENT_ROUTES, contentPermission } from "./config";

export type SaveResult =
  | { ok: true; id: string; version: number; published: boolean; warnings: string[] }
  | { ok: false; error?: string; fieldErrors?: Record<string, string> };

function fieldErrors(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    out[key] ??= issue.message;
  }
  return out;
}

/** Soft checks carried over from the old CMS schema — warn, don't block. */
async function terminWarnings(id: string | null, data: TerminData): Promise<string[]> {
  const warnings: string[] = [];
  if (data.programKey !== "komercijalna-teretana" && data.maxParticipants > 5) {
    warnings.push("Grupni treninzi su po konceptu ograničeni na 5 članova — provjeri da li je namjerno veći broj.");
  }
  if (data.specificDate && data.specificDate < new Date().toISOString().slice(0, 10)) {
    warnings.push("Konkretan datum je već prošao — provjeri da li je greška.");
  }
  const [dup] = await getDb()
    .select({ id: contentDocuments.id })
    .from(contentDocuments)
    .where(
      and(
        eq(contentDocuments.type, "termin"),
        isNull(contentDocuments.deletedAt),
        id ? ne(contentDocuments.id, id) : sql`true`,
        sql`${contentDocuments.draft}->>'programKey' = ${data.programKey}`,
        sql`${contentDocuments.draft}->>'dayOfWeek' = ${data.dayOfWeek}`,
        sql`${contentDocuments.draft}->>'startTime' = ${data.startTime}`,
      ),
    )
    .limit(1);
  if (dup) warnings.push("Već postoji termin za ovaj program, dan i vrijeme početka — provjeri da nije duplikat.");
  return warnings;
}

export async function saveDocumentAction(input: {
  type: ContentType;
  id: string | null;
  data: unknown;
  expectedVersion?: number;
  publish: boolean;
}): Promise<SaveResult> {
  const { type } = input;
  if (!(type in CONTENT_SCHEMAS)) return { ok: false, error: "Nepoznat tip sadržaja." };
  const { user } = await requireUser(contentPermission(type, "edit"));
  if (input.publish) await requireUser(contentPermission(type, "publish"));
  if (!input.id && !CONTENT_META[type].creatable) return { ok: false, error: "Ovaj sadržaj se ne može kreirati." };

  const parsed = CONTENT_SCHEMAS[type].safeParse(input.data);
  if (!parsed.success) {
    return { ok: false, error: "Provjeri označena polja.", fieldErrors: fieldErrors(parsed.error) };
  }
  const data = parsed.data as ContentDataMap[typeof type];
  const actor = await actorFor(user);
  const db = getDb();

  try {
    const warnings = type === "termin" ? await terminWarnings(input.id, data as TerminData) : [];
    if (!input.id) {
      const doc = await createDocument(db, type, data, actor, { publish: input.publish });
      return { ok: true, id: doc.id, version: doc.version, published: input.publish, warnings };
    }
    const result = await saveDraft(db, type, input.id, data, actor, {
      expectedVersion: input.expectedVersion,
      publish: input.publish,
    });
    // Re-render the edit page (status, history) in the same round trip.
    refresh();
    return { ok: true, id: result.doc.id, version: result.doc.version, published: result.published, warnings };
  } catch (error) {
    if (error instanceof ConflictError || error instanceof NotFoundError) return { ok: false, error: error.message };
    console.error(error);
    return { ok: false, error: "Čuvanje nije uspjelo. Pokušaj ponovo." };
  }
}

/* Form actions (bound with type + id) — each redirects back with a flash. */

async function lifecycle(
  type: ContentType,
  id: string,
  op: "publish" | "delete" | "edit",
  run: (actor: Awaited<ReturnType<typeof actorFor>>) => Promise<unknown>,
  flash: string,
  target?: string,
) {
  const { user } = await requireUser(contentPermission(type, op));
  const doc = await getDocument(getDb(), type, id);
  if (!doc) redirect(CONTENT_ROUTES[type]);
  await run(await actorFor(user));
  const base = CONTENT_ROUTES[type];
  redirect(`${target ?? (CONTENT_META[type].singleton ? base : `${base}/${id}`)}?ok=${flash}`);
}

export async function publishAction(type: ContentType, id: string) {
  await lifecycle(type, id, "publish", (actor) => publishDocument(getDb(), id, actor), "published");
}

export async function unpublishAction(type: ContentType, id: string) {
  await lifecycle(type, id, "publish", (actor) => unpublishDocument(getDb(), id, actor), "unpublished");
}

export async function discardAction(type: ContentType, id: string) {
  await lifecycle(type, id, "edit", (actor) => discardChanges(getDb(), id, actor), "discarded");
}

export async function restoreVersionAction(type: ContentType, id: string, versionId: string) {
  await lifecycle(type, id, "edit", (actor) => restoreVersion(getDb(), id, versionId, actor), "restored");
}

export async function trashAction(type: ContentType, id: string) {
  await lifecycle(type, id, "delete", (actor) => trashDocument(getDb(), id, actor), "trashed", CONTENT_ROUTES[type]);
}

export async function untrashAction(type: ContentType, id: string) {
  await lifecycle(type, id, "delete", (actor) => restoreFromTrash(getDb(), id, actor), "untrashed");
}

export async function purgeAction(type: ContentType, id: string) {
  const { user } = await requireUser("content.purge");
  await purgeDocument(getDb(), id, await actorFor(user));
  redirect(`${CONTENT_ROUTES[type]}?trash=1&ok=purged`);
}
