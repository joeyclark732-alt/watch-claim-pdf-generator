"use client";

import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { useEffect, useState } from "react";
import { getProfile, getStoredLicenseKey, listWatches, type ProfileRecord } from "@/lib/db";
import { CanvasRenderer } from "@/lib/layout/canvasRenderer";
import { generateClaimFile } from "@/lib/layout/document";
import { createPdfRenderer } from "@/lib/layout/pdfRenderer";
import { applyPreviewWatermark } from "@/lib/layout/watermark";
import { TIER_LABEL, TIER_PRICE_USD, TIER_RANGE_LABEL, WATCH_CAP, type Tier } from "@/lib/license/tiers";
import { verifyLicenseKey, type LicensePayload } from "@/lib/license/verify";

const TIER_ORDER: Tier[] = ["single", "collection", "unlimited"];

function ExportSection({ ownedCount }: { ownedCount: number }) {
  const [license, setLicense] = useState<LicensePayload | null | undefined>(undefined);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const raw = await getStoredLicenseKey();
      if (!raw) {
        setLicense(null);
        return;
      }
      const verified = await verifyLicenseKey(raw);
      setLicense(verified?.payload ?? null);
    })();
  }, []);

  if (license === undefined) return null;

  if (!license) {
    return (
      <div className="border border-rule p-4 text-sm">
        <p className="mb-3">
          A license unlocks the real, unwatermarked PDF export.{" "}
          <Link href="/license" className="underline underline-offset-2">
            Enter a license key
          </Link>
          .
        </p>
        <table className="w-full border-collapse text-table">
          <tbody>
            {TIER_ORDER.map((tier) => (
              <tr key={tier} className="border-t border-rule">
                <td className="py-1 pr-3">{TIER_LABEL[tier]}</td>
                <td className="py-1 pr-3 text-ink-muted">{TIER_RANGE_LABEL[tier]}</td>
                <td className="py-1 text-right font-mono">${TIER_PRICE_USD[tier]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const cap = WATCH_CAP[license.tier];
  const overCap = cap !== null && ownedCount > cap;

  if (overCap) {
    return (
      <div className="border border-rule p-4 text-sm">
        <p>
          Your {TIER_LABEL[license.tier]} license covers up to {cap} watches; you
          have {ownedCount}.{" "}
          <Link href="/license" className="underline underline-offset-2">
            Upgrade
          </Link>{" "}
          to export all of them.
        </p>
      </div>
    );
  }

  async function handleExport() {
    setError(null);
    setExporting(true);
    try {
      const renderer = await createPdfRenderer();
      await generateClaimFile(renderer);
      const bytes = await renderer.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `watchclaim-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate the PDF.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="border border-rule p-4 text-sm">
      <p className="mb-3 text-ink-muted">
        Licensed: {TIER_LABEL[license.tier]} ({license.email})
      </p>
      {error && <p className="mb-3 text-red-700">{error}</p>}
      <button
        type="button"
        onClick={handleExport}
        disabled={exporting}
        className="border border-oxblood bg-oxblood px-5 py-2 text-sm font-medium text-paper transition hover:opacity-90 disabled:opacity-50"
      >
        {exporting ? "Generating…" : "Export PDF"}
      </button>
    </div>
  );
}

export default function PreviewPage() {
  const [profile, setProfileState] = useState<ProfileRecord | null | undefined>(
    undefined,
  );
  const [pageImages, setPageImages] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ownedCount, setOwnedCount] = useState(0);

  useEffect(() => {
    getProfile().then((p) => setProfileState(p ?? null));
    listWatches().then((watches) =>
      setOwnedCount(watches.filter((w) => w.status === "owned").length),
    );
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
      <header className="border-b border-rule pb-4">
        <Link href="/" className="inline-block">
          <Wordmark />
        </Link>
        <h1 className="mt-3 text-title font-medium">Preview</h1>
        <p className="mt-1 text-xs text-ink-muted">
          Every page at full fidelity, watermarked. The real, unwatermarked
          PDF is generated after purchase.
        </p>
      </header>

      {profile && profileComplete && <ExportSection ownedCount={ownedCount} />}

      {profile === undefined ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : !profileComplete ? (
        <div className="border border-rule p-6 text-sm">
          <p className="mb-4">
            Add your name and mailing address in Settings before previewing —
            they appear on the cover page.
          </p>
          <Link
            href="/settings"
            className="border border-oxblood bg-oxblood px-4 py-2 text-sm font-medium text-paper transition hover:opacity-90"
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
              className="w-full max-w-[612px] border border-rule shadow-sm"
            />
          ))}
        </div>
      )}
    </main>
  );
}
