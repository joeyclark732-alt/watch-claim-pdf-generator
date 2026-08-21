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

function formatValue(watch: WatchRecord): string {
  if (watch.declared_value == null) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: watch.purchase_currency || "USD",
      maximumFractionDigits: 0,
    }).format(watch.declared_value);
  } catch {
    return watch.declared_value.toLocaleString();
  }
}

export default function WatchListPage() {
  const [watches, setWatches] = useState<WatchRecord[] | null>(null);
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    listWatches().then(setWatches);
    listAllPhotos().then(setPhotos);
    listAllDocuments().then(setDocuments);
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
        <Link
          href="/watches/new"
          className="border border-ink bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-accent hover:border-accent"
        >
          + Add watch
        </Link>
      </header>

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
