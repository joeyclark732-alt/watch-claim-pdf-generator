"use client";

import Link from "next/link";
import { BackLink } from "@/components/BackLink";
import { Wordmark } from "@/components/Wordmark";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DocumentPicker, type DraftDocument } from "@/components/DocumentPicker";
import { PhotoPicker, type PhotoSelection } from "@/components/PhotoPicker";
import { WatchForm } from "@/components/WatchForm";
import { createDocument, createWatch, setPhotoForShotType, type ShotType } from "@/lib/db";

export default function NewWatchPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<PhotoSelection>({});
  const [documents, setDocuments] = useState<DraftDocument[]>([]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="border-b border-rule pb-4">
        <BackLink />
        <Link href="/" className="inline-block">
          <Wordmark />
        </Link>
        <h1 className="mt-3 text-title font-medium">Add watch</h1>
      </header>

      <WatchForm
        submitLabel="Save watch"
        onSubmit={async (value) => {
          const watch = await createWatch(value);
          await Promise.all([
            ...Object.entries(photos).map(([shotType, file]) =>
              setPhotoForShotType(watch.id, shotType as ShotType, file as File),
            ),
            ...documents.map((doc) =>
              createDocument(watch.id, {
                doc_type: doc.doc_type,
                file: doc.file,
                issued_date: doc.issued_date,
                issuer_name: doc.issuer_name,
                notes: doc.notes,
              }),
            ),
          ]);
          router.push("/");
        }}
      >
        <PhotoPicker value={photos} onChange={setPhotos} />
        <DocumentPicker value={documents} onChange={setDocuments} />
      </WatchForm>
    </main>
  );
}
