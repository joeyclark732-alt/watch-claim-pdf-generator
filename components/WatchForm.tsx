"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import type { ValuationBasis, WatchInput, WatchStatus } from "@/lib/db";

const EMPTY_WATCH: WatchInput = {
  brand: "",
  model_name: "",
  reference_number: "",
  serial_number: "",
  case_material: "",
  case_diameter_mm: null,
  lug_width_mm: null,
  movement_type: "",
  complications: [],
  strap_type: "",
  purchase_date: null,
  purchase_price: null,
  purchase_currency: "USD",
  purchase_source: "",
  declared_value: null,
  declared_value_date: null,
  valuation_basis: null,
  condition_notes: "",
  has_box: null,
  has_papers: null,
  has_extra_links: null,
  status: "owned",
};

function toNumberOrNull(raw: string): number | null {
  if (raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

const label = "block text-label text-ink-muted mb-1";
const inputBase =
  "w-full border border-rule bg-paper px-2 py-1.5 text-sm text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink";
const input = inputBase;
const inputMono = `${inputBase} font-mono`;
const sectionHeading = "text-label text-ink-muted border-b border-rule pb-1 mb-4";

function TriStateField({
  fieldLabel,
  value,
  onChange,
}: {
  fieldLabel: string;
  value: boolean | null;
  onChange: (value: boolean | null) => void;
}) {
  const options: { label: string; value: boolean | null }[] = [
    { label: "Yes", value: true },
    { label: "No", value: false },
    { label: "Not set", value: null },
  ];
  return (
    <div>
      <label className={label}>{fieldLabel}</label>
      <div className="flex border border-rule text-xs">
        {options.map((opt, i) => (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 px-2 py-1.5 ${i > 0 ? "border-l border-rule" : ""} ${
              value === opt.value
                ? "bg-ink text-paper"
                : "bg-paper text-ink-muted hover:bg-paper-sunk"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function WatchForm({
  initialValue,
  onSubmit,
  submitLabel,
  onDelete,
  submitFullWidth,
  children,
}: {
  initialValue?: WatchInput;
  onSubmit: (value: WatchInput) => Promise<void>;
  submitLabel: string;
  onDelete?: () => Promise<void>;
  /** Stretches the submit button across the full form width, in place of the default inline size. */
  submitFullWidth?: boolean;
  /** Rendered inside the form, after the built-in fields and before the submit button. */
  children?: ReactNode;
}) {
  const [value, setValue] = useState<WatchInput>(initialValue ?? EMPTY_WATCH);
  const [complicationsText, setComplicationsText] = useState(
    (initialValue?.complications ?? []).join(", "),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        ...value,
        complications: complicationsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save watch.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-10">
      <section>
        <h2 className={sectionHeading}>Identification</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div>
            <label className={label}>Brand</label>
            <input
              className={input}
              required
              value={value.brand}
              onChange={(e) => setValue({ ...value, brand: e.target.value })}
            />
          </div>
          <div>
            <label className={label}>Model name</label>
            <input
              className={input}
              required
              value={value.model_name}
              onChange={(e) =>
                setValue({ ...value, model_name: e.target.value })
              }
            />
          </div>
          <div>
            <label className={label}>Reference number</label>
            <input
              className={inputMono}
              value={value.reference_number}
              onChange={(e) =>
                setValue({ ...value, reference_number: e.target.value })
              }
            />
          </div>
          <div>
            <label className={label}>Serial number</label>
            <input
              className={inputMono}
              value={value.serial_number}
              onChange={(e) =>
                setValue({ ...value, serial_number: e.target.value })
              }
            />
          </div>
          <div>
            <label className={label}>Case material</label>
            <input
              className={input}
              value={value.case_material}
              onChange={(e) =>
                setValue({ ...value, case_material: e.target.value })
              }
            />
          </div>
          <div>
            <label className={label}>Case diameter (mm)</label>
            <input
              className={inputMono}
              type="number"
              step="0.1"
              value={value.case_diameter_mm ?? ""}
              onChange={(e) =>
                setValue({
                  ...value,
                  case_diameter_mm: toNumberOrNull(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className={label}>Lug width (mm)</label>
            <input
              className={inputMono}
              type="number"
              step="0.5"
              value={value.lug_width_mm ?? ""}
              onChange={(e) =>
                setValue({
                  ...value,
                  lug_width_mm: toNumberOrNull(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className={label}>Movement type</label>
            <input
              className={input}
              value={value.movement_type}
              onChange={(e) =>
                setValue({ ...value, movement_type: e.target.value })
              }
            />
          </div>
          <div>
            <label className={label}>Strap / bracelet type</label>
            <input
              className={input}
              value={value.strap_type}
              onChange={(e) =>
                setValue({ ...value, strap_type: e.target.value })
              }
            />
          </div>
          <div className="col-span-2 md:col-span-3">
            <label className={label}>Complications (comma separated)</label>
            <input
              className={input}
              value={complicationsText}
              onChange={(e) => setComplicationsText(e.target.value)}
              placeholder="chronograph, date, GMT"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className={sectionHeading}>Purchase History</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div>
            <label className={label}>Purchase date</label>
            <input
              className={inputMono}
              type="date"
              value={value.purchase_date ?? ""}
              onChange={(e) =>
                setValue({
                  ...value,
                  purchase_date: e.target.value || null,
                })
              }
            />
          </div>
          <div>
            <label className={label}>Purchase price</label>
            <input
              className={inputMono}
              type="number"
              step="0.01"
              value={value.purchase_price ?? ""}
              onChange={(e) =>
                setValue({
                  ...value,
                  purchase_price: toNumberOrNull(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className={label}>Purchase currency</label>
            <input
              className={input}
              value={value.purchase_currency}
              onChange={(e) =>
                setValue({ ...value, purchase_currency: e.target.value })
              }
            />
          </div>
          <div className="col-span-2 md:col-span-3">
            <label className={label}>Purchase source</label>
            <input
              className={input}
              value={value.purchase_source}
              onChange={(e) =>
                setValue({ ...value, purchase_source: e.target.value })
              }
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className={sectionHeading}>Valuation</h2>
        <p className="mb-4 -mt-2 text-xs text-ink-muted">
          Declared value is owner-supplied, sourced from your own receipt or a
          third-party appraisal. WatchClaim never estimates or looks up
          market value.
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div>
            <label className={label}>Declared value</label>
            <input
              className={inputMono}
              type="number"
              step="0.01"
              value={value.declared_value ?? ""}
              onChange={(e) =>
                setValue({
                  ...value,
                  declared_value: toNumberOrNull(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className={label}>Declared value date</label>
            <input
              className={inputMono}
              type="date"
              value={value.declared_value_date ?? ""}
              onChange={(e) =>
                setValue({
                  ...value,
                  declared_value_date: e.target.value || null,
                })
              }
            />
          </div>
          <div>
            <label className={label}>Valuation basis</label>
            <select
              className={input}
              value={value.valuation_basis ?? ""}
              onChange={(e) =>
                setValue({
                  ...value,
                  valuation_basis: (e.target.value || null) as
                    | ValuationBasis
                    | null,
                })
              }
            >
              <option value="">Not set</option>
              <option value="receipt">Receipt</option>
              <option value="appraisal">Appraisal</option>
              <option value="owner_estimate">Owner estimate</option>
            </select>
          </div>
        </div>
      </section>

      <section>
        <h2 className={sectionHeading}>Condition & status</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div>
            <label className={label}>Condition notes</label>
            <select
              className={input}
              value={value.condition_notes}
              onChange={(e) =>
                setValue({ ...value, condition_notes: e.target.value })
              }
            >
              <option value="">Not set</option>
              <option value="New">New</option>
              <option value="Used - like new">Used - like new</option>
              <option value="Used">Used</option>
              <option value="Used - visible wear">Used - visible wear</option>
            </select>
          </div>
          <div>
            <label className={label}>Status</label>
            <select
              className={input}
              value={value.status}
              onChange={(e) =>
                setValue({
                  ...value,
                  status: e.target.value as WatchStatus,
                })
              }
            >
              <option value="owned">Owned</option>
              <option value="sold">Sold</option>
              <option value="lost_stolen">Lost / stolen</option>
            </select>
          </div>
          <TriStateField
            fieldLabel="Has box"
            value={value.has_box}
            onChange={(v) => setValue({ ...value, has_box: v })}
          />
          <TriStateField
            fieldLabel="Has papers"
            value={value.has_papers}
            onChange={(v) => setValue({ ...value, has_papers: v })}
          />
          <TriStateField
            fieldLabel="Has extra links"
            value={value.has_extra_links}
            onChange={(v) => setValue({ ...value, has_extra_links: v })}
          />
        </div>
      </section>

      {children}

      {error && <p className="text-sm text-red-700">{error}</p>}

      <div
        className={
          submitFullWidth
            ? "border-t border-rule pt-6"
            : "flex items-center justify-between border-t border-rule pt-6"
        }
      >
        <button
          type="submit"
          disabled={submitting}
          className={
            submitFullWidth
              ? "block w-full border border-oxblood bg-oxblood py-4 text-base font-medium text-paper transition hover:opacity-90 disabled:opacity-50"
              : "border border-oxblood bg-oxblood px-5 py-2 text-sm font-medium text-paper transition hover:opacity-90 disabled:opacity-50"
          }
        >
          {submitting ? "Saving…" : submitLabel}
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="text-sm text-ink-muted underline underline-offset-2 hover:text-red-700"
          >
            Delete watch
          </button>
        )}
      </div>
    </form>
  );
}
