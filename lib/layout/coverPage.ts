import type { ProfileRecord, WatchRecord } from "@/lib/db";
import { formatCurrency } from "@/lib/format/currency";
import { PAGE_HEIGHT_PT, PAGE_WIDTH_PT, type PageRenderer } from "./renderer";
import { INK_MUTED, LINE } from "./theme";
import { wrapText } from "./wrapText";

const MARGIN = 54;

/**
 * Declared value has no currency field of its own (it shares
 * purchase_currency). Summing mismatched currencies into one number would
 * be a real correctness bug on a document meant for an insurance claim, so
 * totals are grouped by currency instead.
 */
function totalsByCurrency(watches: WatchRecord[]): { currency: string; total: number }[] {
  const totals = new Map<string, number>();
  for (const w of watches) {
    if (w.declared_value == null) continue;
    const currency = w.purchase_currency || "USD";
    totals.set(currency, (totals.get(currency) ?? 0) + w.declared_value);
  }
  return Array.from(totals.entries()).map(([currency, total]) => ({ currency, total }));
}

export function renderCoverPage(
  renderer: PageRenderer,
  data: { profile: ProfileRecord; watches: WatchRecord[]; generatedDate: string },
): void {
  renderer.addPage(PAGE_WIDTH_PT, PAGE_HEIGHT_PT);
  const { profile, watches, generatedDate } = data;
  let y = 100;

  renderer.drawText("CLAIM FILE", MARGIN, y, {
    size: 10,
    font: "mono",
    color: INK_MUTED,
  });
  y += 28;
  renderer.drawText("Watch Collection Documentation", MARGIN, y, {
    size: 26,
    font: "sansBold",
  });
  y += 48;

  renderer.drawLine(MARGIN, y, PAGE_WIDTH_PT - MARGIN, y, { color: LINE });
  y += 28;

  for (const line of wrapText(
    profile.full_legal_name,
    PAGE_WIDTH_PT - 2 * MARGIN,
    { size: 13, font: "sans" },
    (t, o) => renderer.measureTextWidth(t, o),
  )) {
    renderer.drawText(line, MARGIN, y, { size: 13, font: "sans" });
    y += 17;
  }
  for (const line of wrapText(
    profile.mailing_address,
    PAGE_WIDTH_PT - 2 * MARGIN,
    { size: 11, font: "sans" },
    (t, o) => renderer.measureTextWidth(t, o),
  )) {
    renderer.drawText(line, MARGIN, y, { size: 11, font: "sans", color: INK_MUTED });
    y += 15;
  }
  y += 20;

  if (profile.insurer_name || profile.policy_number) {
    if (profile.insurer_name) {
      renderer.drawText(`Insurer: ${profile.insurer_name}`, MARGIN, y, {
        size: 11,
        font: "sans",
      });
      y += 16;
    }
    if (profile.policy_number) {
      renderer.drawText(`Policy number: ${profile.policy_number}`, MARGIN, y, {
        size: 11,
        font: "mono",
      });
      y += 16;
    }
    y += 12;
  }

  renderer.drawText(`Date generated: ${generatedDate}`, MARGIN, y, {
    size: 11,
    font: "sans",
  });
  y += 16;
  renderer.drawText(`Item count: ${watches.length}`, MARGIN, y, {
    size: 11,
    font: "sans",
  });
  y += 16;

  const totals = totalsByCurrency(watches);
  if (totals.length === 0) {
    renderer.drawText("Total declared value: —", MARGIN, y, { size: 11, font: "sans" });
    y += 16;
  } else {
    for (const { currency, total } of totals) {
      renderer.drawText(
        `Total declared value${totals.length > 1 ? ` (${currency})` : ""}: ${formatCurrency(total, currency)}`,
        MARGIN,
        y,
        { size: 11, font: "sans" },
      );
      y += 16;
    }
  }

  const disclaimer =
    "Values are owner-declared and sourced from attached receipts or third-party appraisals. This document is not an appraisal.";
  const disclaimerLines = wrapText(
    disclaimer,
    PAGE_WIDTH_PT - 2 * MARGIN,
    { size: 9, font: "sans" },
    (t, o) => renderer.measureTextWidth(t, o),
  );
  let disclaimerY = PAGE_HEIGHT_PT - MARGIN - (disclaimerLines.length - 1) * 12;
  for (const line of disclaimerLines) {
    renderer.drawText(line, MARGIN, disclaimerY, {
      size: 9,
      font: "sans",
      color: INK_MUTED,
    });
    disclaimerY += 12;
  }
}
