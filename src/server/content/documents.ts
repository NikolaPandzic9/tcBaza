import { and, asc, count, desc, eq, isNotNull, isNull, sql, type SQL } from "drizzle-orm";
import { escapeLike } from "../db/sql";
import { writeAudit, type Actor } from "../audit";
import { invalidate } from "../cache";
import type { Database } from "../db/client";
import { contentDocuments, contentVersions, users, type ContentDocument } from "../db/schema";
import { deepEqual } from "./equal";
import { CONTENT_META, documentTitle } from "./registry";
import { CONTENT_SCHEMAS, contentTag, type ContentDataMap, type ContentType } from "./schemas";

export type DocStatus = "draft" | "published" | "changed";

export class ConflictError extends Error {
  constructor() {
    super("Dokument je u međuvremenu izmijenio neko drugi. Osvježi stranicu i pokušaj ponovo.");
  }
}

export class NotFoundError extends Error {
  constructor() {
    super("Dokument nije pronađen.");
  }
}

/** draft = never published · changed = published, with unpublished edits. */
export function docStatus(doc: Pick<ContentDocument, "published" | "version" | "publishedVersion">): DocStatus {
  if (!doc.published) return "draft";
  return doc.publishedVersion === doc.version ? "published" : "changed";
}

export interface TypedDocument<T extends ContentType> extends Omit<ContentDocument, "draft" | "published"> {
  type: T;
  draft: ContentDataMap[T];
  published: ContentDataMap[T] | null;
}

function tagsFor(type: ContentType): string[] {
  // Termin trainer names come from team members, so a team edit must also
  // refresh the schedule.
  return type === "teamMember" ? [contentTag(type), contentTag("termin")] : [contentTag(type)];
}

/* ------------------------------------------------------------------ */
/* Reads                                                               */
/* ------------------------------------------------------------------ */

export interface ListOptions {
  q?: string;
  sort?: string;
  dir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
  status?: DocStatus | "all";
  trash?: boolean;
  filters?: Record<string, string | undefined>;
}

export async function listDocuments<T extends ContentType>(db: Database, type: T, options: ListOptions = {}) {
  const meta = CONTENT_META[type];
  const pageSize = Math.min(Math.max(options.pageSize ?? 20, 5), 100);
  const page = Math.max(options.page ?? 1, 1);

  const where: SQL[] = [eq(contentDocuments.type, type)];
  where.push(options.trash ? isNotNull(contentDocuments.deletedAt) : isNull(contentDocuments.deletedAt));

  const q = options.q?.trim();
  if (q) {
    // Searches every field of the draft (both languages) in one go.
    where.push(sql`${contentDocuments.draft}::text ilike ${`%${escapeLike(q)}%`}`);
  }

  switch (options.status) {
    case "draft":
      where.push(isNull(contentDocuments.published));
      break;
    case "published":
      where.push(sql`${contentDocuments.published} is not null and ${contentDocuments.version} = ${contentDocuments.publishedVersion}`);
      break;
    case "changed":
      where.push(sql`${contentDocuments.published} is not null and ${contentDocuments.version} <> ${contentDocuments.publishedVersion}`);
      break;
  }

  for (const [field, value] of Object.entries(options.filters ?? {})) {
    if (!value || !meta.filterFields.includes(field)) continue;
    where.push(sql`${contentDocuments.draft}->>${field} = ${value}`);
  }

  const sortKey = options.sort && options.sort in meta.sortFields ? options.sort : Object.keys(meta.sortFields)[0];
  const sortExpr = meta.sortFields[sortKey].expr;
  const direction = options.dir === "desc" ? desc : asc;

  const [items, [{ total }]] = await Promise.all([
    db
      .select()
      .from(contentDocuments)
      .where(and(...where))
      .orderBy(direction(sortExpr), desc(contentDocuments.updatedAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ total: count() }).from(contentDocuments).where(and(...where)),
  ]);

  return {
    items: items as TypedDocument<T>[],
    total,
    page,
    pageSize,
    pageCount: Math.max(Math.ceil(total / pageSize), 1),
    sort: sortKey,
    dir: options.dir === "desc" ? ("desc" as const) : ("asc" as const),
  };
}

export async function getDocument<T extends ContentType>(db: Database, type: T, id: string) {
  const [doc] = await db
    .select()
    .from(contentDocuments)
    .where(and(eq(contentDocuments.id, id), eq(contentDocuments.type, type)));
  return (doc as TypedDocument<T> | undefined) ?? null;
}

export async function getDocumentByKey<T extends ContentType>(db: Database, type: T, key: string) {
  const [doc] = await db
    .select()
    .from(contentDocuments)
    .where(and(eq(contentDocuments.type, type), eq(contentDocuments.key, key)));
  return (doc as TypedDocument<T> | undefined) ?? null;
}

/** Live (published, not deleted) data — what the public site renders. */
export async function listPublished<T extends ContentType>(db: Database, type: T) {
  const rows = await db
    .select({ id: contentDocuments.id, key: contentDocuments.key, data: contentDocuments.published })
    .from(contentDocuments)
    .where(
      and(
        eq(contentDocuments.type, type),
        isNull(contentDocuments.deletedAt),
        isNotNull(contentDocuments.published),
      ),
    );
  return rows as { id: string; key: string | null; data: ContentDataMap[T] }[];
}

/** Every non-deleted document's draft — for ERP dropdowns (trainers, programs). */
export async function listDrafts<T extends ContentType>(db: Database, type: T) {
  const rows = await db
    .select({ id: contentDocuments.id, key: contentDocuments.key, data: contentDocuments.draft })
    .from(contentDocuments)
    .where(and(eq(contentDocuments.type, type), isNull(contentDocuments.deletedAt)));
  return rows as { id: string; key: string | null; data: ContentDataMap[T] }[];
}

export async function listVersions(db: Database, documentId: string) {
  return db
    .select({
      id: contentVersions.id,
      version: contentVersions.version,
      event: contentVersions.event,
      createdAt: contentVersions.createdAt,
      data: contentVersions.data,
      username: users.displayName,
    })
    .from(contentVersions)
    .leftJoin(users, eq(users.id, contentVersions.createdBy))
    .where(eq(contentVersions.documentId, documentId))
    .orderBy(desc(contentVersions.createdAt));
}

/* ------------------------------------------------------------------ */
/* Writes                                                              */
/* ------------------------------------------------------------------ */

async function loadForUpdate(tx: Database, id: string) {
  const [doc] = await tx.select().from(contentDocuments).where(eq(contentDocuments.id, id)).for("update");
  if (!doc) throw new NotFoundError();
  return doc;
}

function auditEntityLabel(doc: { type: string; draft: unknown }) {
  const type = doc.type as ContentType;
  return `${CONTENT_META[type].label} „${documentTitle(type, doc.draft as never)}“`;
}

export async function createDocument<T extends ContentType>(
  db: Database,
  type: T,
  data: ContentDataMap[T],
  actor: Actor,
  options: { publish?: boolean; key?: string | null } = {},
) {
  const parsed = CONTENT_SCHEMAS[type].parse(data) as ContentDataMap[T];
  const doc = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(contentDocuments)
      .values({
        type,
        key: options.key ?? null,
        draft: parsed as Record<string, unknown>,
        published: options.publish ? (parsed as Record<string, unknown>) : null,
        publishedAt: options.publish ? new Date() : null,
        version: 1,
        publishedVersion: options.publish ? 1 : null,
        createdBy: actor.id,
        updatedBy: actor.id,
      })
      .returning();
    await tx.insert(contentVersions).values({
      documentId: created.id,
      version: 1,
      data: parsed as Record<string, unknown>,
      event: options.publish ? "create_publish" : "create",
      createdBy: actor.id,
    });
    await writeAudit(tx, actor, {
      action: options.publish ? "create_publish" : "create",
      entityType: type,
      entityId: created.id,
      summary: `Kreiran: ${auditEntityLabel(created)}${options.publish ? " (objavljeno)" : ""}`,
    });
    return created;
  });
  if (options.publish) invalidate(...tagsFor(type));
  return doc as TypedDocument<T>;
}

/**
 * Saves a new draft. `expectedVersion` is the version the editor loaded —
 * if someone saved in the meantime, the save is refused instead of
 * silently overwriting their work.
 */
export async function saveDraft<T extends ContentType>(
  db: Database,
  type: T,
  id: string,
  data: ContentDataMap[T],
  actor: Actor,
  options: { expectedVersion?: number; publish?: boolean } = {},
) {
  const parsed = CONTENT_SCHEMAS[type].parse(data) as Record<string, unknown>;
  const result = await db.transaction(async (tx) => {
    const doc = await loadForUpdate(tx, id);
    if (doc.type !== type) throw new NotFoundError();
    if (options.expectedVersion !== undefined && doc.version !== options.expectedVersion) {
      throw new ConflictError();
    }

    const changed = !deepEqual(doc.draft, parsed);
    const version = changed ? doc.version + 1 : doc.version;

    if (changed) {
      await tx.insert(contentVersions).values({
        documentId: id,
        version,
        data: parsed,
        event: "save",
        createdBy: actor.id,
      });
      await writeAudit(tx, actor, {
        action: "update",
        entityType: type,
        entityId: id,
        summary: `Izmijenjen: ${auditEntityLabel({ type, draft: parsed })}`,
        details: { version },
      });
    }

    const publishNow = options.publish && (changed || doc.publishedVersion !== doc.version);
    if (publishNow) {
      await tx.insert(contentVersions).values({
        documentId: id,
        version,
        data: parsed,
        event: "publish",
        createdBy: actor.id,
      });
      await writeAudit(tx, actor, {
        action: "publish",
        entityType: type,
        entityId: id,
        summary: `Objavljen: ${auditEntityLabel({ type, draft: parsed })}`,
        details: { version },
      });
    }

    const [updated] = await tx
      .update(contentDocuments)
      .set({
        draft: parsed,
        version,
        updatedBy: changed ? actor.id : doc.updatedBy,
        updatedAt: changed ? new Date() : doc.updatedAt,
        ...(publishNow
          ? { published: parsed, publishedVersion: version, publishedAt: new Date() }
          : {}),
      })
      .where(eq(contentDocuments.id, id))
      .returning();
    return { doc: updated, changed, published: Boolean(publishNow) };
  });
  if (result.published) invalidate(...tagsFor(type));
  return result as { doc: TypedDocument<T>; changed: boolean; published: boolean };
}

export async function publishDocument(db: Database, id: string, actor: Actor) {
  const doc = await db.transaction(async (tx) => {
    const doc = await loadForUpdate(tx, id);
    if (doc.deletedAt) throw new NotFoundError();
    await tx.insert(contentVersions).values({
      documentId: id,
      version: doc.version,
      data: doc.draft,
      event: "publish",
      createdBy: actor.id,
    });
    await writeAudit(tx, actor, {
      action: "publish",
      entityType: doc.type,
      entityId: id,
      summary: `Objavljen: ${auditEntityLabel(doc)}`,
      details: { version: doc.version },
    });
    const [updated] = await tx
      .update(contentDocuments)
      .set({ published: doc.draft, publishedVersion: doc.version, publishedAt: new Date() })
      .where(eq(contentDocuments.id, id))
      .returning();
    return updated;
  });
  invalidate(...tagsFor(doc.type as ContentType));
  return doc;
}

export async function unpublishDocument(db: Database, id: string, actor: Actor) {
  const doc = await db.transaction(async (tx) => {
    const doc = await loadForUpdate(tx, id);
    if (CONTENT_META[doc.type as ContentType].singleton) {
      throw new Error("Podešavanja se ne mogu povući s objave.");
    }
    await writeAudit(tx, actor, {
      action: "unpublish",
      entityType: doc.type,
      entityId: id,
      summary: `Povučen s objave: ${auditEntityLabel(doc)}`,
    });
    const [updated] = await tx
      .update(contentDocuments)
      .set({ published: null, publishedVersion: null, publishedAt: null })
      .where(eq(contentDocuments.id, id))
      .returning();
    return updated;
  });
  invalidate(...tagsFor(doc.type as ContentType));
  return doc;
}

/** Throws away unpublished edits — the draft goes back to the live version. */
export async function discardChanges(db: Database, id: string, actor: Actor) {
  return db.transaction(async (tx) => {
    const doc = await loadForUpdate(tx, id);
    if (!doc.published) throw new Error("Dokument još nije objavljen — nema na šta vratiti.");
    const version = doc.version + 1;
    await tx.insert(contentVersions).values({
      documentId: id,
      version,
      data: doc.published,
      event: "discard",
      createdBy: actor.id,
    });
    await writeAudit(tx, actor, {
      action: "discard",
      entityType: doc.type,
      entityId: id,
      summary: `Odbačene neobjavljene izmjene: ${auditEntityLabel(doc)}`,
    });
    const [updated] = await tx
      .update(contentDocuments)
      .set({
        draft: doc.published,
        version,
        publishedVersion: version,
        updatedBy: actor.id,
        updatedAt: new Date(),
      })
      .where(eq(contentDocuments.id, id))
      .returning();
    return updated;
  });
}

/** Loads an older version into the draft (publish separately to go live). */
export async function restoreVersion(db: Database, id: string, versionId: string, actor: Actor) {
  return db.transaction(async (tx) => {
    const doc = await loadForUpdate(tx, id);
    const [old] = await tx
      .select()
      .from(contentVersions)
      .where(and(eq(contentVersions.id, versionId), eq(contentVersions.documentId, id)));
    if (!old) throw new NotFoundError();

    // The schema may have evolved since — re-validate (filling new defaults).
    const parsed = CONTENT_SCHEMAS[doc.type as ContentType].safeParse(old.data);
    if (!parsed.success) {
      throw new Error("Ova verzija ne prolazi trenutnu validaciju i ne može se vratiti.");
    }

    const version = doc.version + 1;
    const data = parsed.data as Record<string, unknown>;
    await tx.insert(contentVersions).values({
      documentId: id,
      version,
      data,
      event: "restore",
      createdBy: actor.id,
    });
    await writeAudit(tx, actor, {
      action: "restore_version",
      entityType: doc.type,
      entityId: id,
      summary: `Vraćena verzija ${old.version}: ${auditEntityLabel(doc)}`,
      details: { fromVersion: old.version, newVersion: version },
    });
    const [updated] = await tx
      .update(contentDocuments)
      .set({ draft: data, version, updatedBy: actor.id, updatedAt: new Date() })
      .where(eq(contentDocuments.id, id))
      .returning();
    return updated;
  });
}

export async function trashDocument(db: Database, id: string, actor: Actor) {
  const doc = await db.transaction(async (tx) => {
    const doc = await loadForUpdate(tx, id);
    const meta = CONTENT_META[doc.type as ContentType];
    if (meta.singleton || !meta.creatable) throw new Error(`${meta.plural}: brisanje nije dozvoljeno.`);
    await writeAudit(tx, actor, {
      action: "delete",
      entityType: doc.type,
      entityId: id,
      summary: `Premješten u otpad: ${auditEntityLabel(doc)}`,
    });
    const [updated] = await tx
      .update(contentDocuments)
      .set({ deletedAt: new Date(), updatedBy: actor.id })
      .where(eq(contentDocuments.id, id))
      .returning();
    return updated;
  });
  invalidate(...tagsFor(doc.type as ContentType));
  return doc;
}

export async function restoreFromTrash(db: Database, id: string, actor: Actor) {
  const doc = await db.transaction(async (tx) => {
    const doc = await loadForUpdate(tx, id);
    await writeAudit(tx, actor, {
      action: "restore",
      entityType: doc.type,
      entityId: id,
      summary: `Vraćen iz otpada: ${auditEntityLabel(doc)}`,
    });
    const [updated] = await tx
      .update(contentDocuments)
      .set({ deletedAt: null, updatedBy: actor.id })
      .where(eq(contentDocuments.id, id))
      .returning();
    return updated;
  });
  invalidate(...tagsFor(doc.type as ContentType));
  return doc;
}

/** Permanent delete — only from the trash. */
export async function purgeDocument(db: Database, id: string, actor: Actor) {
  await db.transaction(async (tx) => {
    const doc = await loadForUpdate(tx, id);
    if (!doc.deletedAt) throw new Error("Trajno se mogu obrisati samo dokumenti iz otpada.");
    await writeAudit(tx, actor, {
      action: "purge",
      entityType: doc.type,
      entityId: id,
      summary: `Trajno obrisan: ${auditEntityLabel(doc)}`,
    });
    await tx.delete(contentDocuments).where(eq(contentDocuments.id, id));
  });
}
