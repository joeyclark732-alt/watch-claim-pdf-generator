"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProfile, type ProfileRecord } from "@/lib/db";
import { CanvasRenderer } from "@/lib/layout/canvasRenderer";
import { generateClaimFile } from "@/lib/layout/document";
import { applyPreviewWatermark } from "@/lib/layout/watermark";

export default function PreviewPage() {
  const [profile, setProfileState] = useState<ProfileRecord | null | undefined>(
    undefined,
  );
  const [pageImages, setPageImages] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProfile().then((p) => setProfileState(p ?? null));
  }, []);

  const profileComplete =
    !!profile &&
    profile.full_legal_name.trim() !== "" &&
    profile.mailing_address.trim() !== "";

  useEffect(() => {
    if (!profileComplete) return;
    let cancelled = false;
    (async () => {
      try {
        const renderer = new CanvasRenderer();
        await generateClaimFile(renderer);
        renderer.pages.forEach(applyPreviewWatermark);
        const dataUrls = renderer.pages.map((canvas) => canvas.toDataURL("image/png"));
        if (!cancelled) setPageImages(dataUrls);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not render the preview.",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profileComplete]);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-12">
      <header className="border-b border-line pb-4">
        <Link
          href="/"
          className="text-xs uppercase tracking-widest text-ink-muted hover:text-ink"
        >
          ← Collection
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">Claim File Preview</h1>
        <p className="mt-1 text-xs text-ink-muted">
          Every page at full fidelity, watermarked. The real, unwatermarked
          PDF is generated after purchase.
        </p>
      </header>

      {profile === undefined ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : !profileComplete ? (
        <div className="border border-line p-6 text-sm">
          <p className="mb-4">
            Add your name and mailing address in Settings before previewing —
            they appear on the cover page.
          </p>
          <Link
            href="/settings"
            className="border border-ink bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-accent hover:border-accent"
          >
            Go to Settings
          </Link>
        </div>
      ) : error ? (
        <p className="text-sm text-red-700">{error}</p>
      ) : pageImages === null ? (
        <p className="text-sm text-ink-muted">Rendering…</p>
      ) : (
        <div className="flex flex-col items-center gap-8">
          {pageImages.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt={`Page ${i + 1}`}
              className="w-full max-w-[612px] border border-line shadow-sm"
            />
          ))}
        </div>
      )}
    </main>
  );
}
