"use client";

import { useEffect, useState } from "react";
import { listDocumentsForWatch, listPhotosForWatch, type WatchRecord } from "@/lib/db";
import { scoreWatch, type CompletenessResult } from "@/lib/scoring/completeness";

export function CompletenessPanel({
  watchId,
  watch,
  refreshKey,
}: {
  watchId: string;
  watch: WatchRecord;
  refreshKey: number;
}) {
  const [result, setResult] = useState<CompletenessResult | null>(null);

  useEffect(() => {
    Promise.all([
      listPhotosForWatch(watchId),
      listDocumentsForWatch(watchId),
    ]).then(([photos, documents]) => {
      setResult(scoreWatch(watch, photos, documents));
    });
  }, [watchId, watch, refreshKey]);

  if (!result) return null;

  return (
    <section className="border border-line">
      <div className="flex items-center justify-between border-b border-line bg-ink/5 px-4 py-2">
        <h2 className="text-xs uppercase tracking-widest text-ink-muted">
          Completeness
        </h2>
        <p className="font-mono text-sm">{result.score}/100</p>
      </div>
      {result.gaps.length > 0 ? (
        <ul className="divide-y divide-line text-sm">
          {result.gaps.map((gap) => (
            <li
              key={gap.label}
              className="flex items-center justify-between px-4 py-2"
            >
              <span>{gap.label}</span>
              <span className="font-mono text-ink-muted">+{gap.points}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-4 py-2 text-sm text-ink-muted">
          Complete — every scored item is filled in.
        </p>
      )}
    </section>
  );
}
