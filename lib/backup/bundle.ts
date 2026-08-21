import {
  getProfile,
  listAllDocuments,
  listAllPhotos,
  listWatches,
  restoreDocuments,
  restorePhotos,
  restoreWatches,
  setProfile,
  type DocumentRecord,
  type PhotoRecord,
  type ProfileRecord,
  type WatchRecord,
} from "@/lib/db";
import { base64ToBlob, blobToBase64 } from "./crypto";

type SerializedDocument = Omit<DocumentRecord, "blob"> & {
  blob_base64: string;
  blob_type: string;
};

type SerializedPhoto = Omit<PhotoRecord, "blob_full" | "blob_thumb"> & {
  blob_full_base64: string;
  blob_full_type: string;
  blob_thumb_base64: string;
  blob_thumb_type: string;
};

export interface BundleData {
  format_version: 1;
  exported_at: string;
  profile: ProfileRecord | null;
  watches: WatchRecord[];
  documents: SerializedDocument[];
  photos: SerializedPhoto[];
}

export async function buildBundle(): Promise<BundleData> {
  const [profile, watches, documents, photos] = await Promise.all([
    getProfile(),
    listWatches(),
    listAllDocuments(),
    listAllPhotos(),
  ]);

  const serializedDocuments: SerializedDocument[] = await Promise.all(
    documents.map(async ({ blob, ...rest }) => ({
      ...rest,
      blob_base64: await blobToBase64(blob),
      blob_type: blob.type,
    })),
  );

  const serializedPhotos: SerializedPhoto[] = await Promise.all(
    photos.map(async ({ blob_full, blob_thumb, ...rest }) => ({
      ...rest,
      blob_full_base64: await blobToBase64(blob_full),
      blob_full_type: blob_full.type,
      blob_thumb_base64: await blobToBase64(blob_thumb),
      blob_thumb_type: blob_thumb.type,
    })),
  );

  return {
    format_version: 1,
    exported_at: new Date().toISOString(),
    profile: profile ?? null,
    watches,
    documents: serializedDocuments,
    photos: serializedPhotos,
  };
}

/**
 * Upsert merge, never a wipe: existing records are left alone, records from
 * the bundle overwrite by ID if already present (safe to import the same
 * backup twice) or are added if not. There is no destructive replace path.
 */
export async function restoreBundle(data: BundleData): Promise<{ watchCount: number }> {
  const watches: WatchRecord[] = data.watches;
  const documents: DocumentRecord[] = data.documents.map(
    ({ blob_base64, blob_type, ...rest }) => ({
      ...rest,
      blob: base64ToBlob(blob_base64, blob_type),
    }),
  );
  const photos: PhotoRecord[] = data.photos.map(
    ({ blob_full_base64, blob_full_type, blob_thumb_base64, blob_thumb_type, ...rest }) => ({
      ...rest,
      blob_full: base64ToBlob(blob_full_base64, blob_full_type),
      blob_thumb: base64ToBlob(blob_thumb_base64, blob_thumb_type),
    }),
  );

  if (data.profile) await setProfile(data.profile);
  await restoreWatches(watches);
  await restoreDocuments(documents);
  await restorePhotos(photos);

  return { watchCount: watches.length };
}
