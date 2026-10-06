import { and, asc, count, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { escapeLike } from "../db/sql";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { writeAudit, type Actor } from "../audit";
import { invalidate } from "../cache";
import type { Database } from "../db/client";
import { contentDocuments, media, type Media } from "../db/schema";
import { removeFile, storeFile } from "./storage";

/** Vercel functions accept ~4.5 MB request bodies; the ERP resizes images
 * in the browser first, so real uploads stay well below this. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_IMAGE_EDGE = 2400;

const DOCUMENT_TYPES: Record<string, { ext: string; mime: string; magic: number[] }> = {
  pdf: { ext: "pdf", mime: "application/pdf", magic: [0x25, 0x50, 0x44, 0x46] },
  docx: {
    ext: "docx",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    magic: [0x50, 0x4b, 0x03, 0x04],
  },
  xlsx: {
    ext: "xlsx",
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    magic: [0x50, 0x4b, 0x03, 0x04],
  },
};

const RASTER_FORMATS = new Set(["jpeg", "png", "webp", "avif", "gif", "heif"]);

export class MediaError extends Error {}

function slugify(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/đ/gi, "dj")
      .toLowerCase()
      .replace(/\.[a-z0-9]+$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "fajl"
  );
}

/**
 * Validates by content, not by the browser-supplied type: images must be
 * decodable rasters (SVG is refused — it can carry script), documents must
 * start with their format's magic bytes. Images are re-encoded to WebP,
 * auto-rotated and capped at 2400px, which also strips EXIF/GPS metadata.
 */
export async function processUpload(filename: string, body: Buffer) {
  if (body.length === 0) throw new MediaError("Fajl je prazan.");
  if (body.length > MAX_UPLOAD_BYTES) throw new MediaError("Fajl je veći od 4 MB.");

  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const doc = DOCUMENT_TYPES[ext];
  if (doc) {
    if (!doc.magic.every((byte, i) => body[i] === byte)) {
      throw new MediaError("Sadržaj fajla ne odgovara njegovoj ekstenziji.");
    }
    return {
      kind: "document" as const,
      body,
      mimeType: doc.mime,
      ext: doc.ext,
      width: null,
      height: null,
    };
  }

  let meta: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>;
  try {
    meta = await sharp(body).metadata();
  } catch {
    throw new MediaError("Podržane su slike (JPG, PNG, WebP, AVIF, GIF, HEIC) i dokumenti (PDF, DOCX, XLSX).");
  }
  if (!meta.format || !RASTER_FORMATS.has(meta.format)) {
    throw new MediaError("Ovaj format slike nije podržan (SVG nije dozvoljen iz sigurnosnih razloga).");
  }

  const { data, info } = await sharp(body, { animated: false })
    .rotate()
    .resize({ width: MAX_IMAGE_EDGE, height: MAX_IMAGE_EDGE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  return {
    kind: "image" as const,
    body: data,
    mimeType: "image/webp",
    ext: "webp",
    width: info.width,
    height: info.height,
  };
}

export async function uploadMedia(
  db: Database,
  file: { name: string; body: Buffer },
  actor: Actor,
  alt: { bs: string; en: string } = { bs: "", en: "" },
) {
  const processed = await processUpload(file.name, file.body);
  const key = `${new Date().getFullYear()}/${randomUUID().slice(0, 8)}-${slugify(file.name)}.${processed.ext}`;
  const stored = await storeFile(key, processed.body, processed.mimeType);

  try {
    const [row] = await db
      .insert(media)
      .values({
        kind: processed.kind,
        storageKey: stored.storageKey,
        url: stored.url,
        filename: file.name.slice(0, 200),
        mimeType: processed.mimeType,
        size: processed.body.length,
        width: processed.width,
        height: processed.height,
        alt,
        createdBy: actor.id,
      })
      .returning();
    await writeAudit(db, actor, {
      action: "media_upload",
      entityType: "media",
      entityId: row.id,
      summary: `Otpremljen fajl „${row.filename}“`,
      details: { size: row.size, kind: row.kind },
    });
    return row;
  } catch (error) {
    await removeFile(stored.storageKey).catch(() => {});
    throw error;
  }
}

export interface MediaListOptions {
  q?: string;
  kind?: "image" | "document";
  sort?: "newest" | "oldest" | "name" | "size";
  page?: number;
  pageSize?: number;
}

export async function listMedia(db: Database, options: MediaListOptions = {}) {
  const pageSize = Math.min(Math.max(options.pageSize ?? 24, 6), 96);
  const page = Math.max(options.page ?? 1, 1);
  const where: SQL[] = [];
  if (options.kind) where.push(eq(media.kind, options.kind));
  const q = options.q?.trim();
  if (q) {
    const like = `%${escapeLike(q)}%`;
    where.push(or(ilike(media.filename, like), sql`${media.alt}::text ilike ${like}`)!);
  }
  const order =
    options.sort === "oldest"
      ? asc(media.createdAt)
      : options.sort === "name"
        ? asc(media.filename)
        : options.sort === "size"
          ? desc(media.size)
          : desc(media.createdAt);

  const condition = where.length ? and(...where) : undefined;
  const [items, [{ total }]] = await Promise.all([
    db.select().from(media).where(condition).orderBy(order).limit(pageSize).offset((page - 1) * pageSize),
    db.select({ total: count() }).from(media).where(condition),
  ]);
  return { items, total, page, pageSize, pageCount: Math.max(Math.ceil(total / pageSize), 1) };
}

export async function getMediaByIds(db: Database, ids: string[]): Promise<Map<string, Media>> {
  if (ids.length === 0) return new Map();
  const rows = await db
    .select()
    .from(media)
    .where(sql`${media.id} in (${sql.join(ids.map((id) => sql`${id}::uuid`), sql`, `)})`);
  return new Map(rows.map((row) => [row.id, row]));
}

/** Content documents (draft or live) that reference this media item. */
export async function findMediaUsages(db: Database, mediaId: string) {
  return db
    .select({ id: contentDocuments.id, type: contentDocuments.type, draft: contentDocuments.draft })
    .from(contentDocuments)
    .where(
      sql`(${contentDocuments.draft}::text like ${`%${mediaId}%`} or coalesce(${contentDocuments.published}::text, '') like ${`%${mediaId}%`})`,
    );
}

export async function updateMediaAlt(db: Database, id: string, alt: { bs: string; en: string }, actor: Actor) {
  const [row] = await db.update(media).set({ alt }).where(eq(media.id, id)).returning();
  if (!row) throw new MediaError("Fajl nije pronađen.");
  await writeAudit(db, actor, {
    action: "media_update",
    entityType: "media",
    entityId: id,
    summary: `Izmijenjen opis slike „${row.filename}“`,
  });
  // Alt text is rendered on the site.
  invalidate("content:program", "content:teamMember", "content:partner");
  return row;
}

export async function deleteMedia(db: Database, id: string, actor: Actor) {
  const [row] = await db.select().from(media).where(eq(media.id, id));
  if (!row) throw new MediaError("Fajl nije pronađen.");
  const usages = await findMediaUsages(db, id);
  if (usages.length > 0) {
    throw new MediaError(`Fajl se koristi na ${usages.length} mjesta — prvo ga ukloni iz sadržaja.`);
  }
  if (row.storageKey.startsWith("static:")) {
    throw new MediaError("Ovo je ugrađena slika sajta i ne može se obrisati iz ERP-a.");
  }
  await db.delete(media).where(eq(media.id, id));
  await removeFile(row.storageKey).catch(() => {});
  await writeAudit(db, actor, {
    action: "media_delete",
    entityType: "media",
    entityId: id,
    summary: `Obrisan fajl „${row.filename}“`,
  });
}
