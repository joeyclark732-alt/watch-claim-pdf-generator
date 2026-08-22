"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  createDocument,
  deleteDocument,
  listDocumentsForWatch,
  type DocType,
  type DocumentRecord,
} from "@/lib/db";
import { useObjectUrl } from "@/lib/hooks/useObjectUrl";

const DOC_TYPES: { value: DocType; label: string }[] = [
  { value: "receipt", label: "Receipt" },
  { value: "warranty_card", label: "Warranty card" },
  { value: "appraisal", label: "Appraisal" },
  { value: "service_record", label: "Service record" },
  { value: "authentication", label: "Authentication" },
  { value: "policy_document", label: "Policy document" },
  { value: "other", label: "Other" },
];

const label = "block text-xs uppercase tracking-wide text-ink-muted mb-1";
const input =
  "w-full border border-rule bg-paper px-2 py-1.5 text-sm font-mono text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink";

function ViewLink({ document }: { document: DocumentRecord }) {
  const url = useObjectUrl(document.blob);
  return (
    <a
      href={url ?? undefined}
      target="_blank"
      rel="noreferrer"
      className="underline underline-offset-2 hover:text-ink"
    >
      View
    </a>
  );
}

export function DocumentList({
  watchId,
  onChange,
}: {
  watchId: string;
  onChange?: () => void;
}) {
  const [documents, setDocuments] = useState<DocumentRecord[] | null>(null);
  const [docType, setDocType] = useState<DocType>("receipt");
  const [issuedDate, setIssuedDate] = useState("");
  const [issuerName, setIssuerName] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listDocumentsForWatch(watchId).then(setDocuments);
  }, [watchId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Choose a file first.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const doc = await createDocument(watchId, {
        doc_type: docType,
        file,
        issued_date: issuedDate || null,
        issuer_name: issuerName,
        notes,
      });
      setDocuments((prev) => [...(prev ?? []), doc]);
      setIssuedDate("");
      setIssuerName("");
      setNotes("");
      if (fileRef.current) fileRef.current.value = "";
      onChange?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save document.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <h2 className="text-xs uppercase tracking-widest text-ink-muted border-b border-rule pb-1 mb-4">
        Documents
      </h2>

      {documents && documents.length > 0 && (
        <ul className="mb-6 flex flex-col divide-y divide-rule border border-rule text-sm">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between gap-3 px-3 py-2"
            >
              <div>
                <p>
                  <span className="capitalize">
                    {doc.doc_type.replace("_", " ")}
                  </span>{" "}
                  <span className="text-ink-muted">— {doc.file_name}</span>
                </p>
                {(doc.issuer_name || doc.issued_date) && (
                  <p className="text-xs text-ink-muted">
                    {[doc.issuer_name, doc.issued_date]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 whitespace-nowrap text-xs">
                <ViewLink document={doc} />
                <button
                  type="button"
                  onClick={async () => {
                    await deleteDocument(doc.id);
                    setDocuments((prev) =>
                      (prev ?? []).filter((d) => d.id !== doc.id),
                    );
                    onChange?.();
                  }}
                  className="text-ink-muted underline underline-offset-2 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-4 border border-rule p-4 md:grid-cols-3"
      >
        <div>
          <label className={label}>Document type</label>
          <select
            className={input}
            value={docType}
            onChange={(e) => setDocType(e.target.value as DocType)}
          >
            {DOC_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>File</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf"
            className={input}
          />
        </div>
        <div>
          <label className={label}>Issued date</label>
          <input
            className={input}
            type="date"
            value={issuedDate}
            onChange={(e) => setIssuedDate(e.target.value)}
          />
        </div>
        <div>
          <label className={label}>Issuer name</label>
          <input
            className={input}
            value={issuerName}
            onChange={(e) => setIssuerName(e.target.value)}
          />
        </div>
        <div className="col-span-2 md:col-span-3">
          <label className={label}>Notes</label>
          <input
            className={input}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        {error && (
          <p className="col-span-2 text-xs text-red-700 md:col-span-3">
            {error}
          </p>
        )}
        <div className="col-span-2 md:col-span-3">
          <button
            type="submit"
            disabled={submitting}
            className="border border-oxblood bg-oxblood px-4 py-2 text-sm font-medium text-paper transition hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Add document"}
          </button>
        </div>
      </form>
    </section>
  );
}
