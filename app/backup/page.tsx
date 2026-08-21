"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { buildBundle, restoreBundle, type BundleData } from "@/lib/backup/bundle";
import { decryptBundle, encryptBundle, type EncryptedBundle } from "@/lib/backup/crypto";
import { resetEditCount } from "@/lib/backup/reminder";

const MIN_PASSPHRASE_LENGTH = 8;

const label = "block text-xs uppercase tracking-wide text-ink-muted mb-1";
const input =
  "w-full border border-line bg-paper px-2 py-1.5 text-sm font-mono text-ink focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent";

function ExportSection() {
  const [passphrase, setPassphrase] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(false);
    if (passphrase.length < MIN_PASSPHRASE_LENGTH) {
      setError(`Passphrase must be at least ${MIN_PASSPHRASE_LENGTH} characters.`);
      return;
    }
    if (passphrase !== confirm) {
      setError("Passphrases don't match.");
      return;
    }
    setBusy(true);
    try {
      const data = await buildBundle();
      const plaintext = new TextEncoder().encode(JSON.stringify(data));
      const encrypted = await encryptBundle(passphrase, plaintext);

      const blob = new Blob([JSON.stringify(encrypted)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `claim-file-backup-${new Date().toISOString().slice(0, 10)}.claimfile`;
      a.click();
      URL.revokeObjectURL(url);

      resetEditCount();
      setDone(true);
      setPassphrase("");
      setConfirm("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not export backup.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 border border-line p-4">
      <h2 className="text-xs uppercase tracking-widest text-ink-muted">Export</h2>
      <div>
        <label className={label}>Passphrase</label>
        <input
          className={input}
          type="password"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
        />
      </div>
      <div>
        <label className={label}>Confirm passphrase</label>
        <input
          className={input}
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {done && (
        <p className="text-sm text-ink-muted">
          Downloaded. Store this file somewhere other than this device — cloud
          storage or another drive, not the machine holding the watches.
        </p>
      )}
      <div>
        <button
          type="submit"
          disabled={busy}
          className="border border-ink bg-ink px-5 py-2 text-sm font-medium text-paper transition hover:bg-accent hover:border-accent disabled:opacity-50"
        >
          {busy ? "Encrypting…" : "Export backup"}
        </button>
      </div>
    </form>
  );
}

function ImportSection() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [passphrase, setPassphrase] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Choose a .claimfile first.");
      return;
    }
    setBusy(true);
    try {
      const text = await file.text();
      const encrypted = JSON.parse(text) as EncryptedBundle;
      const plaintext = await decryptBundle(passphrase, encrypted);
      const data = JSON.parse(new TextDecoder().decode(plaintext)) as BundleData;
      const { watchCount } = await restoreBundle(data);
      setResult(`Restored ${watchCount} watch${watchCount === 1 ? "" : "es"}.`);
      setPassphrase("");
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      setError("Incorrect passphrase or corrupted file.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 border border-line p-4">
      <h2 className="text-xs uppercase tracking-widest text-ink-muted">Import</h2>
      <div>
        <label className={label}>Backup file</label>
        <input ref={fileRef} type="file" accept=".claimfile" className={input} />
      </div>
      <div>
        <label className={label}>Passphrase</label>
        <input
          className={input}
          type="password"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {result && <p className="text-sm text-ink-muted">{result}</p>}
      <div>
        <button
          type="submit"
          disabled={busy}
          className="border border-ink bg-ink px-5 py-2 text-sm font-medium text-paper transition hover:bg-accent hover:border-accent disabled:opacity-50"
        >
          {busy ? "Restoring…" : "Import backup"}
        </button>
      </div>
    </form>
  );
}

export default function BackupPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="border-b border-line pb-4">
        <Link
          href="/"
          className="text-xs uppercase tracking-widest text-ink-muted hover:text-ink"
        >
          ← Collection
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">Backup</h1>
      </header>

      <p className="border border-line bg-ink/5 p-4 text-sm text-ink-muted">
        This device&apos;s local storage is unencrypted at rest. Anyone with
        access to this browser or device can read your records directly. The
        exported backup file below is encrypted; the data sitting in this app
        right now is not.
      </p>

      <ExportSection />
      <ImportSection />
    </main>
  );
}
