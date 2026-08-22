"use client";

import Link from "next/link";
import { BackLink } from "@/components/BackLink";
import { Wordmark } from "@/components/Wordmark";
import { useEffect, useState } from "react";
import { ProfileForm } from "@/components/ProfileForm";
import { getProfile, setProfile, type ProfileRecord } from "@/lib/db";

export default function SettingsPage() {
  const [profile, setLoadedProfile] = useState<ProfileRecord | null | undefined>(
    undefined,
  );

  useEffect(() => {
    getProfile().then((p) => setLoadedProfile(p ?? null));
  }, []);

  const profileComplete =
    !!profile &&
    profile.full_legal_name.trim() !== "" &&
    profile.mailing_address.trim() !== "";

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="flex items-start justify-between border-b border-rule pb-4">
        <div>
          <Link href="/" className="inline-block">
            <Wordmark />
          </Link>
          <h1 className="mt-3 text-title font-medium">Settings</h1>
        </div>
        <BackLink />
      </header>

      {profile === undefined ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : (
        <ProfileForm
          initialValue={profile ?? undefined}
          onSubmit={async (value) => {
            await setProfile(value);
            setLoadedProfile(value);
          }}
        />
      )}

      {profileComplete && (
        <Link
          href="/watches/new"
          className="flex items-center justify-center border border-oxblood bg-oxblood px-6 py-4 text-base font-medium text-paper transition hover:opacity-90"
        >
          Continue to add watch →
        </Link>
      )}
    </main>
  );
}
