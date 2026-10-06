import { del, put } from "@vercel/blob";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, normalize, sep } from "node:path";

/**
 * Where uploaded files live. Production uses Vercel Blob (public CDN URLs);
 * development falls back to .data/uploads served by app/media/[...key].
 * Files that ship with the site (/public) are referenced as "static:".
 */
export const usingBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const LOCAL_ROOT = join(process.cwd(), ".data", "uploads");

function localPath(key: string): string {
  const full = normalize(join(LOCAL_ROOT, key));
  if (!full.startsWith(LOCAL_ROOT + sep)) throw new Error("Neispravna putanja fajla.");
  return full;
}

export interface StoredFile {
  storageKey: string;
  url: string;
}

export async function storeFile(key: string, body: Buffer, contentType: string): Promise<StoredFile> {
  if (usingBlob) {
    const blob = await put(key, body, {
      access: "public",
      contentType,
      addRandomSuffix: false,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    return { storageKey: `blob:${blob.url}`, url: blob.url };
  }
  const path = localPath(key);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, body);
  return { storageKey: `local:${key}`, url: `/media/${key}` };
}

export async function removeFile(storageKey: string) {
  if (storageKey.startsWith("blob:")) {
    await del(storageKey.slice("blob:".length));
  } else if (storageKey.startsWith("local:")) {
    await rm(localPath(storageKey.slice("local:".length)), { force: true });
  }
  // "static:" files belong to the codebase — never deleted from here.
}

export async function readLocalFile(key: string): Promise<Buffer | null> {
  try {
    return await readFile(localPath(key));
  } catch {
    return null;
  }
}
