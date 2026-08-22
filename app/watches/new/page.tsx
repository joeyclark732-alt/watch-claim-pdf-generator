"use client";

import Link from "next/link";
import { BackLink } from "@/components/BackLink";
import { Wordmark } from "@/components/Wordmark";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DocumentPicker, type DraftDocument } from "@/components/DocumentPicker";
import { PhotoPicker, type PhotoSelection } from "@/components/PhotoPicker";
import { WatchForm } from "@/components/WatchForm";
import {
  createDocument,
  createWatch,
  getProfile,
  listWatches,
  setPhotoForShotType,
  type ProfileRecord,
  type ShotType,
} from "@/lib/db";

export default function NewWatchPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<PhotoSelection>({});
  const [documents, setDocuments] = useState<DraftDocument[]>([]);
  const [profile, setProfile] = useState<ProfileRecord | null | undefined>(
    undefined,
  );
  const [isFirstWatch, setIsFirstWatch] = useState<boolean | undefined>(
    undefined,
  );

  useEffect(() => {
    getProfile().then((p) => setProfile(p ?? null));
    listWatches().then((watches) => setIsFirstWatch(watches.length === 0));
  }, []);

  const profileComplete =
    !!profile &&
    profile.full_legal_name.trim() !== "" &&
    profile.mailing_address.trim() !== "";

  const needsProfileFirst =
    isFirstWatch === true && profile !== undefined && !profileComplete;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="flex items-start justify-between border-b border-rule pb-4">
        <div>
          <Link href="/" className="inline-block">
            <Wordmark />
          </Link>
          <h1 className="mt-3 text-title font-medium">Add watch</h1>
        </div>
        <BackLink />
      </header>

      {isFirstWatch === undefined || profile === undefined ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : needsProfileFirst ? (
        <div className="border border-rule p-6 text-sm">
          <p className="mb-4">
            Add your name and mailing address in Settings before adding your
            first watch — they appear on the claim file&apos;s cover page.
          </p>
          <Link
            href="/settings"
            className="border border-oxblood bg-oxblood px-4 py-2 text-sm font-medium text-paper transition hover:opacity-90"
          >
            Go to Settings
          </Link>
        </div>
      ) : (
        <WatchForm
          submitLabel="Save watch"
          submitFullWidth
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
      )}
    </main>
  );
}
