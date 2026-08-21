"use client";

import { useState, type FormEvent } from "react";
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
  has_box: false,
  has_papers: false,
  has_extra_links: false,
  status: "owned",
};

function toNumberOrNull(raw: string): number | null {
  if (raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

const label = "block text-xs uppercase tracking-wide text-ink-muted mb-1";
const input =
  "w-full border border-line bg-paper px-2 py-1.5 text-sm font-mono text-ink focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent";
const sectionHeading =
  "text-xs uppercase tracking-widest text-ink-muted border-b border-line pb-1 mb-4";

export function WatchForm({
  initialValue,
  onSubmit,
  submitLabel,
  onDelete,
}: {
  initialValue?: WatchInput;
  onSubmit: (value: WatchInput) => Promise<void>;
  submitLabel: string;
  onDelete?: () => Promise<void>;
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
              className={input}
              value={value.reference_number}
              onChange={(e) =>
                setValue({ ...value, reference_number: e.target.value })
              }
            />
          </div>
          <div>
            <label className={label}>Serial number</label>
            <input
              className={input}
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
              className={input}
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
              className={input}
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
        <h2 className={sectionHeading}>Provenance</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div>
            <label className={label}>Purchase date</label>
            <input
              className={input}
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
              className={input}
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
          third-party appraisal. Claim File never estimates or looks up
          market value.
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div>
            <label className={label}>Declared value</label>
            <input
              className={input}
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
              className={input}
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
          <div className="col-span-2 md:col-span-3">
            <label className={label}>Condition notes</label>
            <textarea
              className={input}
              rows={3}
              value={value.condition_notes}
              onChange={(e) =>
                setValue({ ...value, condition_notes: e.target.value })
              }
              placeholder="Marks, scratches, patina, replaced parts"
            />
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
          <div className="flex flex-col justify-end gap-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={value.has_box}
                onChange={(e) =>
                  setValue({ ...value, has_box: e.target.checked })
                }
              />
              Has box
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={value.has_papers}
                onChange={(e) =>
                  setValue({ ...value, has_papers: e.target.checked })
                }
              />
              Has papers
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={value.has_extra_links}
                onChange={(e) =>
                  setValue({ ...value, has_extra_links: e.target.checked })
                }
              />
              Has extra links
            </label>
          </div>
        </div>
      </section>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <div className="flex items-center justify-between border-t border-line pt-6">
        <button
          type="submit"
          disabled={submitting}
          className="border border-ink bg-ink px-5 py-2 text-sm font-medium text-paper transition hover:bg-accent hover:border-accent disabled:opacity-50"
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
