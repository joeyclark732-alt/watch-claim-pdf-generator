"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  deletePhoto,
  listPhotosForWatch,
  setPhotoForShotType,
  type PhotoRecord,
  type ShotType,
} from "@/lib/db";
import { useObjectUrl } from "@/lib/hooks/useObjectUrl";
import { ShotExampleButton } from "./ShotExampleButton";

const SHOT_TYPES: { type: ShotType; label: string; hint: string }[] = [
  { type: "dial", label: "Dial", hint: "Straight on, full face" },
  { type: "caseback", label: "Caseback", hint: "Straight on" },
  {
    type: "serial_macro",
    label: "Serial macro",
    hint: "Between the lugs, on the caseback, or the rehaut",
  },
  {
    type: "clasp",
    label: "Clasp & bracelet",
    hint: "Showing any engraving",
  },
  {
    type: "side_profile",
    label: "Side profile",
    hint: "Crown and pushers visible",
  },
  {
    type: "movement",
    label: "Movement",
    hint: "If you have a display back or it's open",
  },
  {
    type: "box_papers",
    label: "Box & papers",
    hint: "Box, papers, hangtags, extra links, together",
  },
  { type: "on_wrist", label: "On wrist", hint: "For scale and identification" },
];

function PhotoThumb({ blob }: { blob: Blob }) {
  const url = useObjectUrl(blob);
  if (!url) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className="h-32 w-full object-cover" />;
}

function ShotSlot({
  type,
  slotLabel,
  hint,
  photo,
  onUpload,
  onDelete,
}: {
  type: ShotType;
  slotLabel: string;
  hint: string;
  photo: PhotoRecord | undefined;
  onUpload: (file: File) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save photo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border border-rule">
      <div className="flex items-center justify-between gap-2 border-b border-rule bg-paper-sunk px-3 py-1.5">
        <p className="text-label">{slotLabel}</p>
        <ShotExampleButton type={type} label={slotLabel} hint={hint} />
      </div>
      {photo ? (
        <div>
          <PhotoThumb blob={photo.blob_thumb} />
          <div className="flex items-center justify-between px-3 py-2 text-xs">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-ink-muted underline underline-offset-2 hover:text-ink"
            >
              Retake
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="text-ink-muted underline underline-offset-2 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex h-32 w-full flex-col items-center justify-center gap-1 px-2 text-center text-ink-muted hover:bg-paper-sunk disabled:opacity-50"
        >
          <span className="text-sm">{busy ? "Saving…" : "+ Add photo"}</span>
          <span className="text-xs">{hint}</span>
        </button>
      )}
      {error && <p className="px-3 pb-2 text-xs text-red-700">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}

export function PhotoChecklist({
  watchId,
  onChange,
}: {
  watchId: string;
  onChange?: () => void;
}) {
  const [photos, setPhotos] = useState<PhotoRecord[] | null>(null);

  useEffect(() => {
    listPhotosForWatch(watchId).then(setPhotos);
  }, [watchId]);

  const byShotType = new Map((photos ?? []).map((p) => [p.shot_type, p]));

  return (
    <section>
      <h2 className="text-label text-ink-muted border-b border-rule pb-1 mb-4">
        Photos
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {SHOT_TYPES.map(({ type, label, hint }) => (
          <ShotSlot
            key={type}
            type={type}
            slotLabel={label}
            hint={hint}
            photo={byShotType.get(type)}
            onUpload={async (file) => {
              const photo = await setPhotoForShotType(watchId, type, file);
              setPhotos((prev) => [
                ...(prev ?? []).filter((p) => p.shot_type !== type),
                photo,
              ]);
              onChange?.();
            }}
            onDelete={async () => {
              const existing = byShotType.get(type);
              if (!existing) return;
              await deletePhoto(existing.id);
              setPhotos((prev) =>
                (prev ?? []).filter((p) => p.id !== existing.id),
              );
              onChange?.();
            }}
          />
        ))}
      </div>
    </section>
  );
}
