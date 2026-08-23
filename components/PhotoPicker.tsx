"use client";

import { useRef, type ChangeEvent } from "react";
import type { ShotType } from "@/lib/db";
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

function LocalPhotoThumb({ file }: { file: File }) {
  const url = useObjectUrl(file);
  if (!url) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className="h-32 w-full object-cover" />;
}

function LocalShotSlot({
  type,
  slotLabel,
  hint,
  file,
  onSelect,
  onRemove,
}: {
  type: ShotType;
  slotLabel: string;
  hint: string;
  file: File | undefined;
  onSelect: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    e.target.value = "";
    if (selected) onSelect(selected);
  }

  return (
    <div className="border border-rule">
      <div className="flex items-center justify-between gap-2 border-b border-rule bg-paper-sunk px-3 py-1.5">
        <p className="text-label">{slotLabel}</p>
        <ShotExampleButton type={type} label={slotLabel} hint={hint} />
      </div>
      {file ? (
        <div>
          <LocalPhotoThumb file={file} />
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
              onClick={onRemove}
              className="text-ink-muted underline underline-offset-2 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-32 w-full flex-col items-center justify-center gap-1 px-2 text-center text-ink-muted hover:bg-paper-sunk"
        >
          <span className="text-sm">+ Add photo</span>
          <span className="text-xs">{hint}</span>
        </button>
      )}
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

export type PhotoSelection = Partial<Record<ShotType, File>>;

export function PhotoPicker({
  value,
  onChange,
}: {
  value: PhotoSelection;
  onChange: (value: PhotoSelection) => void;
}) {
  return (
    <section>
      <h2 className="text-label text-ink-muted border-b border-rule pb-1 mb-4">
        Photos
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {SHOT_TYPES.map(({ type, label: shotLabel, hint }) => (
          <LocalShotSlot
            key={type}
            type={type}
            slotLabel={shotLabel}
            hint={hint}
            file={value[type]}
            onSelect={(file) => onChange({ ...value, [type]: file })}
            onRemove={() => {
              const next = { ...value };
              delete next[type];
              onChange(next);
            }}
          />
        ))}
      </div>
    </section>
  );
}
