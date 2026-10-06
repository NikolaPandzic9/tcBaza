import { NextResponse } from "next/server";
import { readLocalFile } from "@/server/media/storage";

const TYPES: Record<string, string> = {
  webp: "image/webp",
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

/**
 * Serves uploads stored on local disk (development, or a self-hosted
 * deployment without Vercel Blob). With Blob configured, uploads have
 * their own CDN URLs and this route is never linked.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const path = key.join("/");
  const file = await readLocalFile(path);
  if (!file) return new NextResponse("Not found", { status: 404 });

  const ext = path.split(".").pop() ?? "";
  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": TYPES[ext] ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      ...(ext !== "webp" ? { "Content-Disposition": "attachment" } : {}),
    },
  });
}
