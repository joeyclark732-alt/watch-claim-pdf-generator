import type { WatchRecord } from "@/lib/db";
import { formatCurrency } from "@/lib/format/currency";
import { createPageCursor } from "./cursor";
import { PAGE_HEIGHT_PT, PAGE_WIDTH_PT, type PageRenderer } from "./renderer";
import { INK_MUTED, LINE } from "./theme";

const MARGIN = 54;
const ROW_HEIGHT = 20;
const HEADER_HEIGHT = 24;

const COLUMNS: { label: string; width: number; align?: "left" | "right" }[] = [
  { label: "#", width: 22 },
  { label: "Brand", width: 76 },
  { label: "Model", width: 88 },
  { label: "Reference", width: 68 },
  { label: "Serial", width: 68 },
  { label: "Value", width: 62, align: "right" },
  { label: "Basis", width: 60 },
  { label: "Val. date", width: 60 },
];

function columnX(index: number): number {
  let x = MARGIN;
  for (let i = 0; i < index; i++) x += COLUMNS[i].width;
  return x;
}

function drawColumnHeaders(renderer: PageRenderer, y: number): number {
  renderer.drawText("Summary Schedule", MARGIN, y, { size: 14, font: "sansBold" });
  y += 26;
  COLUMNS.forEach((col, i) => {
    renderer.drawText(col.label, columnX(i) + (col.align === "right" ? col.width - 4 : 0), y, {
      size: 8,
      font: "mono",
      color: INK_MUTED,
      align: col.align === "right" ? "right" : "left",
      maxWidth: col.width - 4,
    });
  });
  y += 6;
  renderer.drawLine(MARGIN, y, PAGE_WIDTH_PT - MARGIN, y, { color: LINE });
  return y + HEADER_HEIGHT - 6;
}

const BASIS_LABEL: Record<string, string> = {
  receipt: "Receipt",
  appraisal: "Appraisal",
  owner_estimate: "Owner est.",
};

export function renderSummarySchedule(renderer: PageRenderer, watches: WatchRecord[]): void {
  renderer.addPage(PAGE_WIDTH_PT, PAGE_HEIGHT_PT);
  const cursor = createPageCursor(drawColumnHeaders(renderer, 80));

  watches.forEach((watch, index) => {
    if (cursor.wouldOverflow(ROW_HEIGHT)) {
      cursor.breakPage(renderer, () => drawColumnHeaders(renderer, 80));
    }
    const rowY = cursor.y;
    const cells = [
      String(index + 1),
      watch.brand || "—",
      watch.model_name || "—",
      watch.reference_number || "—",
      watch.serial_number || "—",
      watch.declared_value != null
        ? formatCurrency(watch.declared_value, watch.purchase_currency)
        : "—",
      watch.valuation_basis ? BASIS_LABEL[watch.valuation_basis] : "—",
      watch.declared_value_date || "—",
    ];
    cells.forEach((text, i) => {
      const col = COLUMNS[i];
      renderer.drawText(text, columnX(i) + (col.align === "right" ? col.width - 4 : 0), rowY, {
        size: 9,
        font: i === 1 || i === 2 ? "sans" : "mono",
        align: col.align === "right" ? "right" : "left",
        maxWidth: col.width - 4,
      });
    });
    cursor.advance(ROW_HEIGHT);
  });
}
