"use client";

import { useState } from "react";
import type { ShotType } from "@/lib/db";
import { Modal } from "./Modal";
import { ShotExampleIllustration } from "./ShotExamples";

export function ShotExampleButton({
  type,
  label,
  hint,
}: {
  type: ShotType;
  label: string;
  hint: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Example photo for ${label}`}
        className="flex h-4 w-4 shrink-0 items-center justify-center border border-ink-muted text-[10px] leading-none text-ink-muted hover:border-ink hover:text-ink"
      >
        i
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={label}>
        <div className="flex justify-center border border-rule bg-paper-sunk p-6">
          <ShotExampleIllustration type={type} className="h-40 w-40 text-ink-muted" />
        </div>
        <p className="mt-4 text-sm text-ink-body">{hint}</p>
      </Modal>
    </>
  );
}
