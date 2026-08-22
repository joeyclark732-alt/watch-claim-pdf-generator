"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  listAllDocuments,
  listAllPhotos,
  listWatches,
  type DocumentRecord,
  type PhotoRecord,
  type WatchRecord,
} from "@/lib/db";
import { scoreWatch, weightedCollectionScore } from "@/lib/scoring/completeness";
import { formatCurrency } from "@/lib/format/currency";
import { BACKUP_REMINDER_THRESHOLD, getEditCount } from "@/lib/backup/reminder";

function formatValue(watch: WatchRecord): string {
  if (watch.declared_value == null) return "—";
  return formatCurrency(watch.declared_value, watch.purchase_currency);
}

export function CollectionList() {
  const [watches, setWatches] = useState<WatchRecord[] | null>(null);
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [showAll, setShowAll] = useState(false);
  // Starts at 0 to match the statically-prerendered HTML (no localStorage at
  // build time), then corrected in the effect below. A lazy initializer here
  // would read the real value on the client's first render too, mismatching
  // the prerendered markup — the two-render pattern is required, not optional,
  // despite the lint rule below normally warning against it.
  const [editCount, setEditCount] = useState(0);

  useEffect(() => {
    listWatches().then(setWatches);
    listAllPhotos().then(setPhotos);
    listAllDocuments().then(setDocuments);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEditCount(getEditCount());
  }, []);

  const visible = (watches ?? []).filter(
    (w) => showAll || w.status === "owned",
  );

  const scores = new Map(
    (watches ?? []).map((w) => [
      w.id,
      scoreWatch(
        w,
        photos.filter((p) => p.watch_id === w.id),
        documents.filter((d) => d.watch_id === w.id),
      ).score,
    ]),
  );
  const collectionScore = watches
    ? weightedCollectionScore(watches, scores)
    : null;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="flex items-end justify-between border-b border-line pb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink-muted">
            Claim File
          </p>
          <h1 className="text-2xl font-semibold">Collection</h1>
          {collectionScore !== null && visible.length > 0 && (
            <p className="mt-1 text-xs text-ink-muted">
              Collection completeness (value-weighted):{" "}
              <span className="font-mono text-ink">
                {collectionScore}/100
              </span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/settings"
            className="text-xs uppercase tracking-widest text-ink-muted hover:text-ink"
          >
            Settings
          </Link>
          <Link
            href="/preview"
            className="text-xs uppercase tracking-widest text-ink-muted hover:text-ink"
          >
            Preview claim file
          </Link>
          <Link
            href="/license"
            className="text-xs uppercase tracking-widest text-ink-muted hover:text-ink"
          >
            License
          </Link>
          <Link
            href="/backup"
            className="text-xs uppercase tracking-widest text-ink-muted hover:text-ink"
          >
            Backup
          </Link>
          <Link
            href="/watches/new"
            className="border border-ink bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-accent hover:border-accent"
          >
            + Add watch
          </Link>
        </div>
      </header>

      {editCount >= BACKUP_REMINDER_THRESHOLD && (
        <div className="flex items-center justify-between border border-line bg-ink/5 px-4 py-2 text-sm">
          <span>
            You&apos;ve made {editCount} changes since your last backup.
          </span>
          <Link
            href="/backup"
            className="underline underline-offset-2 hover:text-ink"
          >
            Export a backup
          </Link>
        </div>
      )}

      <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-ink-muted">
        <input
          type="checkbox"
          checked={showAll}
          onChange={(e) => setShowAll(e.target.checked)}
        />
        Show sold / lost watches
      </label>

      {watches === null ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-ink-muted">
          No watches recorded yet.{" "}
          <Link href="/watches/new" className="underline underline-offset-2">
            Add your first one
          </Link>
          .
        </p>
      ) : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-ink/5 text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-3 py-2 font-medium">Brand</th>
                <th className="px-3 py-2 font-medium">Model</th>
                <th className="px-3 py-2 font-medium">Reference</th>
                <th className="px-3 py-2 font-medium">Serial</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 text-right font-medium">
                  Completeness
                </th>
                <th className="px-3 py-2 text-right font-medium">
                  Declared value
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((watch) => (
                <tr
                  key={watch.id}
                  className="border-b border-line last:border-b-0 hover:bg-ink/5"
                >
                  <td className="px-3 py-2">
                    <Link
                      href={`/watches/edit?id=${watch.id}`}
                      className="hover:underline"
                    >
                      {watch.brand || "—"}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{watch.model_name || "—"}</td>
                  <td className="px-3 py-2 font-mono">
                    {watch.reference_number || "—"}
                  </td>
                  <td className="px-3 py-2 font-mono">
                    {watch.serial_number || "—"}
                  </td>
                  <td className="px-3 py-2 capitalize">
                    {watch.status.replace("_", " / ")}
                  </td>
                  <td className="px-3 py-2 text-right font-mono">
                    {scores.get(watch.id)}/100
                  </td>
                  <td className="px-3 py-2 text-right font-mono">
                    {formatValue(watch)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
