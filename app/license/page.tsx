"use client";

import Link from "next/link";
import { BackLink } from "@/components/BackLink";
import { Wordmark } from "@/components/Wordmark";
import { useEffect, useState } from "react";
import { getStoredLicenseKey, setStoredLicenseKey } from "@/lib/db";
import { TIER_LABEL, TIER_PRICE_USD, TIER_RANGE_LABEL, type Tier } from "@/lib/license/tiers";
import { verifyLicenseKey, type LicensePayload } from "@/lib/license/verify";

const label = "block text-label text-ink-muted mb-1";
const input =
  "w-full border border-rule bg-paper px-2 py-1.5 text-sm font-mono text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink";

const TIER_ORDER: Tier[] = ["single", "collection", "unlimited"];

export default function LicensePage() {
  const [current, setCurrent] = useState<LicensePayload | null | undefined>(undefined);
  const [raw, setRaw] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const stored = await getStoredLicenseKey();
      if (!stored) {
        setCurrent(null);
        return;
      }
      const verified = await verifyLicenseKey(stored);
      setCurrent(verified?.payload ?? null);
    })();
  }, []);

  async function handleSave() {
    setError(null);
    setBusy(true);
    try {
      const verified = await verifyLicenseKey(raw);
      if (!verified) {
        setError("Invalid license key.");
        return;
      }
      await setStoredLicenseKey(raw.trim());
      setCurrent(verified.payload);
      setRaw("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="flex items-start justify-between border-b border-rule pb-4">
        <div>
          <Link href="/" className="inline-block">
            <Wordmark />
          </Link>
          <h1 className="mt-3 text-title font-medium">License</h1>
        </div>
        <BackLink />
      </header>

      {current !== undefined && (
        <div className="border border-rule p-4 text-sm">
          {current ? (
            <p>
              Active license: <span className="font-mono">{TIER_LABEL[current.tier]}</span>{" "}
              <span className="text-ink-muted">({current.email})</span>
            </p>
          ) : (
            <p className="text-ink-muted">No active license on this device.</p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 border border-rule p-4">
        <label className={label}>License key</label>
        <textarea
          className={input}
          rows={3}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="Paste the license key from your purchase email"
        />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <div>
          <button
            type="button"
            onClick={handleSave}
            disabled={busy || raw.trim() === ""}
            className="border border-oxblood bg-oxblood px-5 py-2 text-sm font-medium text-paper transition hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Verifying…" : "Save license"}
          </button>
        </div>
      </div>

      <div className="border border-rule">
        <table className="w-full border-collapse text-table">
          <thead>
            <tr className="border-b border-rule bg-paper-sunk text-left text-label text-ink-muted">
              <th className="px-3 py-2 font-medium">Tier</th>
              <th className="px-3 py-2 font-medium">Covers</th>
              <th className="px-3 py-2 text-right font-medium">Price</th>
            </tr>
          </thead>
          <tbody>
            {TIER_ORDER.map((tier) => (
              <tr key={tier} className="border-b border-rule last:border-b-0">
                <td className="px-3 py-2">{TIER_LABEL[tier]}</td>
                <td className="px-3 py-2 text-ink-muted">{TIER_RANGE_LABEL[tier]}</td>
                <td className="px-3 py-2 text-right font-mono">${TIER_PRICE_USD[tier]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
