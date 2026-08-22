"use client";

import { useRef, useState } from "react";
import type { DocType } from "@/lib/db";

const DOC_TYPES: { value: DocType; label: string }[] = [
  { value: "receipt", label: "Receipt" },
  { value: "warranty_card", label: "Warranty card" },
  { value: "appraisal", label: "Appraisal" },
  { value: "service_record", label: "Service record" },
  { value: "authentication", label: "Authentication" },
  { value: "policy_document", label: "Policy document" },
  { value: "other", label: "Other" },
];

const label = "block text-label text-ink-muted mb-1";
const inputBase =
  "w-full border border-rule bg-paper px-2 py-1.5 text-sm text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink";
const input = inputBase;
const inputMono = `${inputBase} font-mono`;

export interface DraftDocument {
  id: string;
  doc_type: DocType;
  file: File;
  issued_date: string | null;
  issuer_name: string;
  notes: string;
}

export function DocumentPicker({
  value,
  onChange,
}: {
  value: DraftDocument[];
  onChange: (value: DraftDocument[]) => void;
}) {
  const [docType, setDocType] = useState<DocType>("receipt");
  const [issuedDate, setIssuedDate] = useState("");
  const [issuerName, setIssuerName] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleAdd() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Choose a file first.");
      return;
    }
    onChange([
      ...value,
      {
        id: crypto.randomUUID(),
        doc_type: docType,
        file,
        issued_date: issuedDate || null,
        issuer_name: issuerName,
        notes,
      },
    ]);
    setIssuedDate("");
    setIssuerName("");
    setNotes("");
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <section>
      <h2 className="text-label text-ink-muted border-b border-rule pb-1 mb-4">
        Documents
      </h2>

      {value.length > 0 && (
        <ul className="mb-6 flex flex-col divide-y divide-rule border border-rule text-sm">
          {value.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between gap-3 px-3 py-2"
            >
              <div>
                <p>
                  <span className="capitalize">
                    {doc.doc_type.replace("_", " ")}
                  </span>{" "}
                  <span className="text-ink-muted">— {doc.file.name}</span>
                </p>
                {(doc.issuer_name || doc.issued_date) && (
                  <p className="text-xs text-ink-muted">
                    {[doc.issuer_name, doc.issued_date]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() =>
                  onChange(value.filter((d) => d.id !== doc.id))
                }
                className="text-ink-muted underline underline-offset-2 hover:text-red-700"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-2 gap-4 border border-rule p-4 md:grid-cols-3">
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
          <input ref={fileRef} type="file" accept="image/*,application/pdf" className={input} />
        </div>
        <div>
          <label className={label}>Issued date</label>
          <input
            className={inputMono}
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
            type="button"
            onClick={handleAdd}
            className="border border-oxblood bg-oxblood px-4 py-2 text-sm font-medium text-paper transition hover:opacity-90"
          >
            Add document
          </button>
        </div>
      </div>
    </section>
  );
}
