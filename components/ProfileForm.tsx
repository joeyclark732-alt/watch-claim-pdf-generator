"use client";

import { useState, type FormEvent } from "react";
import type { ProfileRecord } from "@/lib/db";

const EMPTY_PROFILE: ProfileRecord = {
  full_legal_name: "",
  mailing_address: "",
  insurer_name: "",
  policy_number: "",
};

const label = "block text-xs uppercase tracking-wide text-ink-muted mb-1";
const input =
  "w-full border border-rule bg-paper px-2 py-1.5 text-sm font-mono text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink";

export function ProfileForm({
  initialValue,
  onSubmit,
}: {
  initialValue?: ProfileRecord;
  onSubmit: (value: ProfileRecord) => Promise<void>;
}) {
  const [value, setValue] = useState<ProfileRecord>(initialValue ?? EMPTY_PROFILE);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSaved(false);
    try {
      await onSubmit(value);
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={label}>Full legal name</label>
          <input
            className={input}
            required
            value={value.full_legal_name}
            onChange={(e) =>
              setValue({ ...value, full_legal_name: e.target.value })
            }
          />
        </div>
        <div className="md:col-span-2">
          <label className={label}>Mailing address</label>
          <textarea
            className={input}
            rows={3}
            value={value.mailing_address}
            onChange={(e) =>
              setValue({ ...value, mailing_address: e.target.value })
            }
          />
        </div>
        <div>
          <label className={label}>Insurer name</label>
          <input
            className={input}
            value={value.insurer_name}
            onChange={(e) =>
              setValue({ ...value, insurer_name: e.target.value })
            }
          />
        </div>
        <div>
          <label className={label}>Policy number</label>
          <input
            className={input}
            value={value.policy_number}
            onChange={(e) =>
              setValue({ ...value, policy_number: e.target.value })
            }
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
