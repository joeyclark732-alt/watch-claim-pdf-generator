const CHECKLIST_FULL_MAX_DIM = 2400;
const CHECKLIST_FULL_QUALITY = 0.85;
const CHECKLIST_THUMB_MAX_DIM = 400;
const CHECKLIST_THUMB_QUALITY = 0.85;

const DOCUMENT_MAX_DIM = 3000;
const DOCUMENT_QUALITY = 0.9;

/**
 * Decodes a File to a bitmap with EXIF orientation baked into the pixels.
 * `imageOrientation: "from-image"` matters here: canvas drawing ignores the
 * EXIF orientation tag by default, and since re-encoding strips EXIF
 * entirely, an unrotated draw would come out sideways with no tag left to
 * fix it afterward.
 */
async function decode(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error(
      "Couldn't read this image. It may be corrupted or in a format this browser can't decode.",
    );
  }
}

function reencode(
  bitmap: ImageBitmap,
  maxDim: number,
  quality: number,
): Promise<Blob> {
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context unavailable.");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Image re-encoding failed."));
      },
      "image/jpeg",
      quality,
    );
  });
}

/**
 * Every image reaches IndexedDB only through here or `processForDocument` —
 * never as the original File. Re-encoding through canvas, not tag deletion,
 * is what strips EXIF (including GPS): it can't miss a vendor-specific
 * metadata block the way selectively deleting known tags could.
 */
export async function processForChecklist(
  file: File,
): Promise<{ full: Blob; thumb: Blob }> {
  const bitmap = await decode(file);
  try {
    const [full, thumb] = await Promise.all([
      reencode(bitmap, CHECKLIST_FULL_MAX_DIM, CHECKLIST_FULL_QUALITY),
      reencode(bitmap, CHECKLIST_THUMB_MAX_DIM, CHECKLIST_THUMB_QUALITY),
    ]);
    return { full, thumb };
  } finally {
    bitmap.close();
  }
}

/**
 * For image-type document attachments (e.g. a photographed receipt). Larger
 * and higher-quality than the checklist pipeline, with no thumb variant,
 * since a document's fine print needs to stay legible and the `documents`
 * store has only one blob field.
 */
export async function processForDocument(file: File): Promise<Blob> {
  const bitmap = await decode(file);
  try {
    return await reencode(bitmap, DOCUMENT_MAX_DIM, DOCUMENT_QUALITY);
  } finally {
    bitmap.close();
  }
}
