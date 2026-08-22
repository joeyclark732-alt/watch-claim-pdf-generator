"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { WatchForm } from "@/components/WatchForm";
import { createWatch } from "@/lib/db";

export default function NewWatchPage() {
  const router = useRouter();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="border-b border-rule pb-4">
        <Link
          href="/"
          className="text-xs uppercase tracking-widest text-ink-muted hover:text-ink"
        >
          ← Collection
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">Add watch</h1>
      </header>

      <WatchForm
        submitLabel="Save watch"
        onSubmit={async (value) => {
          const watch = await createWatch(value);
          router.push(`/watches/edit?id=${watch.id}`);
        }}
      />
    </main>
  );
}
