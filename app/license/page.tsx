"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getStoredLicenseKey, setStoredLicenseKey } from "@/lib/db";
import { TIER_LABEL, TIER_PRICE_USD, TIER_RANGE_LABEL, type Tier } from "@/lib/license/tiers";
import { verifyLicenseKey, type LicensePayload } from "@/lib/license/verify";

const label = "block text-xs uppercase tracking-wide text-ink-muted mb-1";
const input =
  "w-full border border-line bg-paper px-2 py-1.5 text-sm font-mono text-ink focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent";

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
      <header className="border-b border-line pb-4">
        <Link
          href="/"
          className="text-xs uppercase tracking-widest text-ink-muted hover:text-ink"
        >
          ← Collection
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">License</h1>
      </header>

      {current !== undefined && (
        <div className="border border-line p-4 text-sm">
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

      <div className="flex flex-col gap-3 border border-line p-4">
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
            className="border border-ink bg-ink px-5 py-2 text-sm font-medium text-paper transition hover:bg-accent hover:border-accent disabled:opacity-50"
          >
            {busy ? "Verifying…" : "Save license"}
          </button>
        </div>
      </div>

      <div className="border border-line">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-ink/5 text-left text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-3 py-2 font-medium">Tier</th>
              <th className="px-3 py-2 font-medium">Covers</th>
              <th className="px-3 py-2 text-right font-medium">Price</th>
            </tr>
          </thead>
          <tbody>
            {TIER_ORDER.map((tier) => (
              <tr key={tier} className="border-b border-line last:border-b-0">
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
