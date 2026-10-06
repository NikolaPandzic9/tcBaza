/**
 * Shrinks large photos in the browser before upload: phone pictures are
 * often 5–12 MB, above the ~4.5 MB a Vercel function accepts. The server
 * still re-encodes and validates everything — this only saves bandwidth.
 */
const MAX_EDGE = 2400;
const TARGET_BYTES = 3.5 * 1024 * 1024;

export async function prepareUpload(file: File): Promise<File> {
  const resizable = /^image\/(jpeg|png|webp)$/.test(file.type);
  if (!resizable || (file.size < TARGET_BYTES && file.size < 1.5 * 1024 * 1024)) return file;

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    for (const quality of [0.9, 0.8, 0.7]) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
      if (blob && blob.size <= TARGET_BYTES) {
        return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
      }
    }
  } catch {
    // Browser couldn't decode it (e.g. HEIC) — let the server decide.
  }
  return file;
}
