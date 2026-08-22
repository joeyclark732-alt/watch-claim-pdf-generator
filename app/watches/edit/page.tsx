"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CompletenessPanel } from "@/components/CompletenessPanel";
import { DocumentList } from "@/components/DocumentList";
import { PhotoChecklist } from "@/components/PhotoChecklist";
import { WatchForm } from "@/components/WatchForm";
import { deleteWatch, getWatch, updateWatch, type WatchRecord } from "@/lib/db";

export default function EditWatchPage() {
  return (
    <Suspense fallback={null}>
      <EditWatchForm />
    </Suspense>
  );
}

function EditWatchForm() {
  const id = useSearchParams().get("id") ?? "";
  const router = useRouter();
  const [loaded, setLoaded] = useState<WatchRecord | null | undefined>(
    undefined,
  );
  const watch = id ? loaded : null;
  const [refreshKey, setRefreshKey] = useState(0);
  const bumpRefresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    if (!id) return;
    getWatch(id).then((w) => setLoaded(w ?? null));
  }, [id]);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="border-b border-rule pb-4">
        <Link
          href="/"
          className="text-xs uppercase tracking-widest text-ink-muted hover:text-ink"
        >
          ← Collection
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">
          {watch ? `${watch.brand} ${watch.model_name}`.trim() || "Watch" : "Watch"}
        </h1>
      </header>

      {watch === undefined ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : watch === null ? (
        <p className="text-sm text-ink-muted">
          Watch not found. It may have been deleted.
        </p>
      ) : (
        <>
          <CompletenessPanel
            watchId={watch.id}
            watch={watch}
            refreshKey={refreshKey}
          />

          <WatchForm
            initialValue={watch}
            submitLabel="Save changes"
            onSubmit={async (value) => {
              const updated = await updateWatch(watch.id, value);
              setLoaded(updated);
            }}
            onDelete={async () => {
              if (
                !window.confirm(
                  "Delete this watch? This cannot be undone. Documents and photos attached to it (once added) will also be removed.",
                )
              ) {
                return;
              }
              await deleteWatch(watch.id);
              router.push("/");
            }}
          />

          <PhotoChecklist watchId={watch.id} onChange={bumpRefresh} />
          <DocumentList watchId={watch.id} onChange={bumpRefresh} />
        </>
      )}
    </main>
  );
}
