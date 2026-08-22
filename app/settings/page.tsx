"use client";

import Link from "next/link";
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

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="border-b border-rule pb-4">
        <Link
          href="/"
          className="text-xs uppercase tracking-widest text-ink-muted hover:text-ink"
        >
          ← Collection
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">Settings</h1>
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
    </main>
  );
}
