"use client";

import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { useRouter } from "next/navigation";
import { WatchForm } from "@/components/WatchForm";
import { createWatch } from "@/lib/db";

export default function NewWatchPage() {
  const router = useRouter();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="border-b border-rule pb-4">
        <Link href="/" className="inline-block">
          <Wordmark />
        </Link>
        <h1 className="mt-3 text-title font-medium">Add watch</h1>
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
