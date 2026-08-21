import type { DocumentRecord, PhotoRecord, ShotType, WatchRecord } from "@/lib/db";

export interface CompletenessGap {
  label: string;
  points: number;
}

export interface CompletenessResult {
  score: number;
  gaps: CompletenessGap[];
}

const APPRAISAL_FRESHNESS_MONTHS = 24;

function monthsSince(isoDate: string): number {
  const then = new Date(isoDate);
  const now = new Date();
  return (
    (now.getFullYear() - then.getFullYear()) * 12 +
    (now.getMonth() - then.getMonth())
  );
}

function hasShot(photos: PhotoRecord[], shotType: ShotType): boolean {
  return photos.some((p) => p.shot_type === shotType);
}

/**
 * The 11 line items from spec §5, summing to exactly 100. Each unmet check
 * becomes a specific, point-valued instruction rather than a vague nag.
 */
export function scoreWatch(
  watch: WatchRecord,
  photos: PhotoRecord[],
  documents: DocumentRecord[],
): CompletenessResult {
  const gaps: CompletenessGap[] = [];
  let score = 0;

  function check(met: boolean, points: number, gapLabel: string) {
    if (met) {
      score += points;
    } else {
      gaps.push({ label: gapLabel, points });
    }
  }

  check(watch.serial_number.trim() !== "", 15, "Record the serial number");
  check(
    watch.reference_number.trim() !== "",
    10,
    "Record the reference number",
  );

  const hasProofOfValue = documents.some(
    (d) => d.doc_type === "receipt" || d.doc_type === "appraisal",
  );
  check(hasProofOfValue, 20, "Attach a receipt or appraisal");

  const hasFreshAppraisal = documents.some(
    (d) =>
      d.doc_type === "appraisal" &&
      d.issued_date !== null &&
      monthsSince(d.issued_date) <= APPRAISAL_FRESHNESS_MONTHS,
  );
  check(
    hasFreshAppraisal,
    15,
    "Attach an appraisal dated within the last 24 months",
  );

  check(hasShot(photos, "serial_macro"), 10, "Add a macro photo of the serial number");
  check(hasShot(photos, "dial"), 5, "Add a dial photo");
  check(hasShot(photos, "caseback"), 5, "Add a caseback photo");
  check(hasShot(photos, "clasp"), 5, "Add a clasp/bracelet photo");
  check(hasShot(photos, "side_profile"), 5, "Add a side profile photo");

  check(
    watch.has_box !== null && watch.has_papers !== null,
    5,
    "Record box & papers status",
  );
  check(watch.condition_notes.trim() !== "", 5, "Add condition notes");

  return { score, gaps };
}

/**
 * Declared-value-weighted average over owned watches, not a flat average —
 * a complete $400 Seiko shouldn't paper over a bare $30k Daytona entry.
 * Falls back to a plain average when every owned watch lacks a declared
 * value, to avoid a divide-by-zero.
 */
export function weightedCollectionScore(
  watches: WatchRecord[],
  scores: Map<string, number>,
): number {
  const owned = watches.filter((w) => w.status === "owned");
  if (owned.length === 0) return 0;

  const totalValue = owned.reduce((sum, w) => sum + (w.declared_value ?? 0), 0);
  if (totalValue === 0) {
    const total = owned.reduce((sum, w) => sum + (scores.get(w.id) ?? 0), 0);
    return Math.round(total / owned.length);
  }

  const weighted = owned.reduce(
    (sum, w) => sum + (scores.get(w.id) ?? 0) * (w.declared_value ?? 0),
    0,
  );
  return Math.round(weighted / totalValue);
}
