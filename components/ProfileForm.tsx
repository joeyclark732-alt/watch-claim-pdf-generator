"use client";

import { useState, type FormEvent } from "react";
import type { ProfileRecord } from "@/lib/db";

const label = "block text-label text-ink-muted mb-1";
const inputBase =
  "w-full border border-rule bg-paper px-2 py-1.5 text-sm text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink";
const input = inputBase;
const inputMono = `${inputBase} font-mono`;

/**
 * mailing_address stays a single newline-joined string in storage (and on
 * the PDF cover page, which already wraps on "\n") so this is purely a UI
 * split/join — no schema or PDF-rendering change needed. The city/state/zip
 * line is parsed with a plain "City, ST ZIP" pattern; anything that doesn't
 * match that shape lands whole in the city field rather than being dropped,
 * so re-saving never loses data even for an address entered before this
 * structured form existed.
 */
function parseAddress(raw: string): {
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
} {
  const lines = raw.split("\n").filter((l) => l.trim() !== "");
  const line1 = lines[0] ?? "";
  const cityLine = lines.length >= 3 ? lines[2] : lines.length === 2 ? lines[1] : "";
  const line2 = lines.length >= 3 ? lines[1] : "";

  const match = cityLine.match(/^(.*),\s*([A-Za-z]{2,})\s+([\w-]+)$/);
  if (match) {
    return { line1, line2, city: match[1].trim(), state: match[2], zip: match[3] };
  }
  return { line1, line2, city: cityLine, state: "", zip: "" };
}

function combineAddress(fields: {
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
}): string {
  const cityState = [fields.city.trim(), fields.state.trim()]
    .filter(Boolean)
    .join(", ");
  const cityStateZip = [cityState, fields.zip.trim()].filter(Boolean).join(" ");
  return [fields.line1.trim(), fields.line2.trim(), cityStateZip]
    .filter(Boolean)
    .join("\n");
}

export function ProfileForm({
  initialValue,
  onSubmit,
}: {
  initialValue?: ProfileRecord;
  onSubmit: (value: ProfileRecord) => Promise<void>;
}) {
  const [fullLegalName, setFullLegalName] = useState(
    initialValue?.full_legal_name ?? "",
  );
  const [address, setAddress] = useState(() =>
    parseAddress(initialValue?.mailing_address ?? ""),
  );
  const [insurerName, setInsurerName] = useState(
    initialValue?.insurer_name ?? "",
  );
  const [policyNumber, setPolicyNumber] = useState(
    initialValue?.policy_number ?? "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSaved(false);
    try {
      await onSubmit({
        full_legal_name: fullLegalName,
        mailing_address: combineAddress(address),
        insurer_name: insurerName,
        policy_number: policyNumber,
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <p className="text-xs text-ink-muted">
        Used only for the cover page of your exported claim file. Stays on
        this device like everything else.
      </p>

      <div>
        <label className={label}>Full legal name</label>
        <input
          className={input}
          required
          value={fullLegalName}
          onChange={(e) => setFullLegalName(e.target.value)}
        />
      </div>

      <div className="border border-rule p-4">
        <h2 className="mb-4 text-label text-ink-muted">Mailing address</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className={label}>Address line 1</label>
            <input
              className={input}
              required
              autoComplete="address-line1"
              value={address.line1}
              onChange={(e) =>
                setAddress({ ...address, line1: e.target.value })
              }
            />
          </div>
          <div>
            <label className={label}>Address line 2 (optional)</label>
            <input
              className={input}
              autoComplete="address-line2"
              placeholder="Apartment, suite, etc."
              value={address.line2}
              onChange={(e) =>
                setAddress({ ...address, line2: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="col-span-2">
              <label className={label}>City</label>
              <input
                className={input}
                required
                autoComplete="address-level2"
                value={address.city}
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
              />
            </div>
            <div>
              <label className={label}>State</label>
              <input
                className={input}
                required
                autoComplete="address-level1"
                value={address.state}
                onChange={(e) =>
                  setAddress({ ...address, state: e.target.value })
                }
              />
            </div>
            <div>
              <label className={label}>ZIP code</label>
              <input
                className={inputMono}
                required
                autoComplete="postal-code"
                value={address.zip}
                onChange={(e) =>
                  setAddress({ ...address, zip: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={label}>Insurer name</label>
          <input
            className={input}
            value={insurerName}
            onChange={(e) => setInsurerName(e.target.value)}
          />
        </div>
        <div>
          <label className={label}>Policy number</label>
          <input
            className={inputMono}
            value={policyNumber}
            onChange={(e) => setPolicyNumber(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <div className="flex items-center gap-4 border-t border-rule pt-6">
        <button
          type="submit"
          disabled={submitting}
          className="border border-oxblood bg-oxblood px-5 py-2 text-sm font-medium text-paper transition hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Save profile"}
        </button>
        {saved && !submitting && (
          <span className="text-sm text-ink-muted">Saved.</span>
        )}
      </div>
    </form>
  );
}
