"use server";

import { redirect } from "next/navigation";
import { actorFor, requireUser } from "@/server/auth/current";
import { getDb } from "@/server/db/client";
import { MediaError, deleteMedia, listMedia, updateMediaAlt, uploadMedia } from "@/server/media/media";

export interface MediaItem {
  id: string;
  url: string;
  filename: string;
  kind: "image" | "document";
  alt: { bs: string; en: string };
  width: number | null;
  height: number | null;
  size: number;
}

const toItem = (m: Awaited<ReturnType<typeof listMedia>>["items"][number]): MediaItem => ({
  id: m.id,
  url: m.url,
  filename: m.filename,
  kind: m.kind,
  alt: m.alt,
  width: m.width,
  height: m.height,
  size: m.size,
});

export async function pickerListMedia(input: { q?: string; page?: number; kind?: "image" | "document" }) {
  await requireUser("content.edit");
  const result = await listMedia(getDb(), { q: input.q, page: input.page, kind: input.kind, pageSize: 18 });
  return { items: result.items.map(toItem), page: result.page, pageCount: result.pageCount };
}

export type UploadResult = { ok: true; item: MediaItem } | { ok: false; error: string };

export async function uploadMediaAction(formData: FormData): Promise<UploadResult> {
  const { user } = await requireUser("media.manage");
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "Nije izabran fajl." };
  const altBs = String(formData.get("altBs") ?? "").trim().slice(0, 200);
  const altEn = String(formData.get("altEn") ?? "").trim().slice(0, 200);
  try {
    const row = await uploadMedia(
      getDb(),
      { name: file.name, body: Buffer.from(await file.arrayBuffer()) },
      await actorFor(user),
      { bs: altBs, en: altEn },
    );
    return { ok: true, item: toItem(row) };
  } catch (error) {
    if (error instanceof MediaError) return { ok: false, error: error.message };
    console.error(error);
    return { ok: false, error: "Otpremanje nije uspjelo." };
  }
}

export async function updateAltAction(id: string, formData: FormData) {
  const { user } = await requireUser("media.manage");
  await updateMediaAlt(
    getDb(),
    id,
    {
      bs: String(formData.get("altBs") ?? "").trim().slice(0, 200),
      en: String(formData.get("altEn") ?? "").trim().slice(0, 200),
    },
    await actorFor(user),
  );
  redirect(`/mediji?selected=${id}&ok=saved`);
}

export async function deleteMediaAction(id: string): Promise<{ error?: string }> {
  const { user } = await requireUser("media.manage");
  try {
    await deleteMedia(getDb(), id, await actorFor(user));
  } catch (error) {
    if (error instanceof MediaError) return { error: error.message };
    throw error;
  }
  redirect("/mediji?ok=deleted");
}
