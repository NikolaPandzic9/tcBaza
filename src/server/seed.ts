import { count, eq } from "drizzle-orm";
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SYSTEM_ACTOR, writeAudit } from "./audit";
import type { Database } from "./db/client";
import { appMeta, media, users } from "./db/schema";
import { createDocument } from "./content/documents";
import {
  DEFAULT_STATIC_MEDIA,
  defaultHomeFaq,
  defaultPartners,
  defaultPrograms,
  defaultRecoveryServices,
  defaultSiteSettings,
  defaultTeam,
} from "./content/defaults";
import { hashPassword } from "./auth/password";

const SEED_MARKER = "content_seeded_at";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  svg: "image/svg+xml",
};

/** Registers the images that ship in /public as media-library items. */
async function seedStaticMedia(db: Database) {
  for (const item of DEFAULT_STATIC_MEDIA) {
    const [existing] = await db.select({ id: media.id }).from(media).where(eq(media.id, item.id));
    if (existing) continue;
    const file = await readFile(join(process.cwd(), "public", item.path));
    const ext = item.path.split(".").pop()!.toLowerCase();
    const meta = ext === "svg" ? null : await sharp(file).metadata();
    await db.insert(media).values({
      id: item.id,
      kind: "image",
      storageKey: `static:${item.path}`,
      url: item.path,
      filename: item.path.split("/").pop()!,
      mimeType: MIME[ext] ?? "application/octet-stream",
      size: file.length,
      width: meta?.width ?? null,
      height: meta?.height ?? null,
      alt: item.alt,
    });
  }
}

/**
 * Idempotent: content is imported once (guarded by a marker row, so
 * deleting e.g. every partner later doesn't resurrect them on the next
 * deploy). Everything is created as published — it's already live today.
 */
export async function seedContent(db: Database, log: (msg: string) => void = console.log) {
  const [marker] = await db.select().from(appMeta).where(eq(appMeta.key, SEED_MARKER));
  if (marker) {
    log(`Sadržaj je već uvezen (${marker.value}) — preskačem.`);
    return false;
  }

  await seedStaticMedia(db);
  const actor = SYSTEM_ACTOR;
  const publish = { publish: true } as const;

  for (const program of defaultPrograms()) {
    await createDocument(db, "program", program.data, actor, { ...publish, key: program.key });
  }
  for (const member of defaultTeam()) await createDocument(db, "teamMember", member, actor, publish);
  for (const partner of defaultPartners()) await createDocument(db, "partner", partner, actor, publish);
  for (const service of defaultRecoveryServices()) await createDocument(db, "recoveryService", service, actor, publish);
  for (const item of defaultHomeFaq()) await createDocument(db, "faqItem", item, actor, publish);
  await createDocument(db, "siteSettings", defaultSiteSettings(), actor, { ...publish, key: "siteSettings" });

  const now = new Date().toISOString();
  await db.insert(appMeta).values({ key: SEED_MARKER, value: now });
  await writeAudit(db, actor, { action: "seed", summary: "Uvezen početni sadržaj sajta" });
  log("Uvezen početni sadržaj sajta.");
  return true;
}

/**
 * Creates the first administrator from environment variables when the
 * users table is empty. The password never appears in code or logs.
 */
export async function ensureInitialAdmin(db: Database, log: (msg: string) => void = console.log) {
  const [{ n }] = await db.select({ n: count() }).from(users);
  if (n > 0) return false;

  const username = (process.env.ERP_ADMIN_USERNAME ?? "Luka").trim();
  const password = process.env.ERP_ADMIN_PASSWORD;
  if (!password) {
    log("UPOZORENJE: nema korisnika, a ERP_ADMIN_PASSWORD nije postavljen — početni admin nije kreiran.");
    return false;
  }

  const [user] = await db
    .insert(users)
    .values({
      username,
      usernameKey: username.toLowerCase(),
      displayName: username,
      role: "admin",
      passwordHash: await hashPassword(password),
    })
    .returning();
  await writeAudit(db, SYSTEM_ACTOR, {
    action: "user_create",
    entityType: "user",
    entityId: user.id,
    summary: `Kreiran početni administrator „${username}“`,
  });
  log(`Kreiran početni administrator „${username}“.`);
  return true;
}
