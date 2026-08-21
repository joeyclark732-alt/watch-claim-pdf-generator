import { processForChecklist } from "@/lib/images/process";
import { getDB } from "./client";
import type { PhotoRecord, ShotType } from "./schema";

export async function listPhotosForWatch(
  watchId: string,
): Promise<PhotoRecord[]> {
  const db = await getDB();
  return db.getAllFromIndex("photos", "watch_id", watchId);
}

/** For collection-wide scoring: one full-table read, grouped by watch_id in JS. */
export async function listAllPhotos(): Promise<PhotoRecord[]> {
  const db = await getDB();
  return db.getAll("photos");
}

/**
 * Each shot type is a single named slot, not an accumulating gallery —
 * uploading a new photo for a slot that's already filled replaces it.
 */
export async function setPhotoForShotType(
  watchId: string,
  shotType: ShotType,
  file: File,
): Promise<PhotoRecord> {
  const { full, thumb } = await processForChecklist(file);

  const db = await getDB();
  const tx = db.transaction("photos", "readwrite");
  const existing = await tx.store.index("watch_id").getAll(watchId);
  await Promise.all(
    existing
      .filter((photo) => photo.shot_type === shotType)
      .map((photo) => tx.store.delete(photo.id)),
  );

  const photo: PhotoRecord = {
    id: crypto.randomUUID(),
    watch_id: watchId,
    shot_type: shotType,
    blob_full: full,
    blob_thumb: thumb,
    taken_at: new Date().toISOString(),
  };
  await tx.store.put(photo);
  await tx.done;

  return photo;
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("photos", id);
}
