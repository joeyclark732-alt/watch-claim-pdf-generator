import type { DocumentRecord, PhotoRecord, ShotType, WatchRecord } from "@/lib/db";
import { formatCurrency } from "@/lib/format/currency";
import { createPageCursor } from "./cursor";
import { PAGE_HEIGHT_PT, PAGE_WIDTH_PT, type PageRenderer } from "./renderer";
import { INK_MUTED, RULE } from "./theme";
import { wrapText } from "./wrapText";

const MARGIN = 54;
const CONTENT_WIDTH = PAGE_WIDTH_PT - 2 * MARGIN;

/** Fixed order and captions, confirmed in Phase 3a — box_papers/on_wrist are excluded from the printed grid. */
const GRID_SHOT_TYPES: { type: ShotType; caption: string }[] = [
  { type: "dial", caption: "Dial" },
  { type: "caseback", caption: "Caseback" },
  { type: "serial_macro", caption: "Serial macro" },
  { type: "clasp", caption: "Clasp & bracelet" },
  { type: "side_profile", caption: "Side profile" },
  { type: "movement", caption: "Movement" },
];

const DOC_TYPE_LABEL: Record<DocumentRecord["doc_type"], string> = {
  receipt: "Receipt",
  warranty_card: "Warranty card",
  appraisal: "Appraisal",
  service_record: "Service record",
  authentication: "Authentication",
  policy_document: "Policy document",
  other: "Other",
};

function drawItemHeader(renderer: PageRenderer, watch: WatchRecord, y: number): number {
  renderer.drawText(`${watch.brand} ${watch.model_name}`.trim() || "Watch", MARGIN, y, {
    size: 16,
    font: "serif",
    maxWidth: CONTENT_WIDTH,
  });
  y += 18;
  const refLine = [
    watch.reference_number && `Ref. ${watch.reference_number}`,
    watch.serial_number && `Serial ${watch.serial_number}`,
  ]
    .filter(Boolean)
    .join("   ·   ");
  if (refLine) {
    renderer.drawText(refLine, MARGIN, y, { size: 10, font: "mono", color: INK_MUTED });
    y += 14;
  }
  y += 8;
  renderer.drawLine(MARGIN, y, PAGE_WIDTH_PT - MARGIN, y, { color: RULE });
  return y + 20;
}

function sectionLabel(renderer: PageRenderer, text: string, y: number): void {
  renderer.drawText(text, MARGIN, y, {
    size: 8,
    font: "sans",
    color: INK_MUTED,
    tracking: 0.08,
  });
}

const GRID_ROW_H = 26;
/** Gap from a section's label to its first content row. */
const SECTION_TOP_GAP = 16;
/** Gap after a section's content before the next section's label. */
const SECTION_BOTTOM_GAP = 10;

function fieldGridHeight(count: number, columns: number): number {
  return Math.ceil(count / columns) * GRID_ROW_H;
}

function drawFieldGrid(
  renderer: PageRenderer,
  y: number,
  fields: { label: string; value: string; mono?: boolean }[],
  columns: number,
): void {
  const colWidth = CONTENT_WIDTH / columns;
  fields.forEach((f, i) => {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const fx = MARGIN + col * colWidth;
    const fy = y + row * GRID_ROW_H;
    renderer.drawText(f.label, fx, fy, {
      size: 7,
      font: "sans",
      color: INK_MUTED,
      maxWidth: colWidth - 8,
      tracking: 0.08,
    });
    renderer.drawText(f.value, fx, fy + 13, {
      size: 10,
      font: f.mono ? "mono" : "sans",
      maxWidth: colWidth - 8,
    });
  });
}

export async function renderItemPage(
  renderer: PageRenderer,
  watch: WatchRecord,
  photos: PhotoRecord[],
  documents: DocumentRecord[],
): Promise<void> {
  renderer.addPage(PAGE_WIDTH_PT, PAGE_HEIGHT_PT);
  const header = () => drawItemHeader(renderer, watch, 80);
  const cursor = createPageCursor(header());

  function ensureRoom(height: number): void {
    if (cursor.wouldOverflow(height)) {
      cursor.breakPage(renderer, header);
    }
  }

  // Identification
  const idFields = [
    { label: "Reference number", value: watch.reference_number || "—", mono: true },
    { label: "Serial number", value: watch.serial_number || "—", mono: true },
    { label: "Case material", value: watch.case_material || "—" },
    { label: "Case diameter", value: watch.case_diameter_mm != null ? `${watch.case_diameter_mm} mm` : "—", mono: true },
    { label: "Lug width", value: watch.lug_width_mm != null ? `${watch.lug_width_mm} mm` : "—", mono: true },
    { label: "Movement", value: watch.movement_type || "—" },
    { label: "Strap / bracelet", value: watch.strap_type || "—" },
    { label: "Complications", value: watch.complications.length ? watch.complications.join(", ") : "—" },
  ];
  const idHeight = fieldGridHeight(idFields.length, 3);
  ensureRoom(SECTION_TOP_GAP + idHeight + SECTION_BOTTOM_GAP);
  sectionLabel(renderer, "Identification", cursor.y);
  drawFieldGrid(renderer, cursor.y + SECTION_TOP_GAP, idFields, 3);
  cursor.advance(SECTION_TOP_GAP + idHeight + SECTION_BOTTOM_GAP);

  // Provenance
  const provFields = [
    { label: "Purchase date", value: watch.purchase_date || "—", mono: true },
    {
      label: "Purchase price",
      value: watch.purchase_price != null ? formatCurrency(watch.purchase_price, watch.purchase_currency) : "—",
      mono: true,
    },
    { label: "Purchase source", value: watch.purchase_source || "—" },
  ];
  const provHeight = fieldGridHeight(provFields.length, 3);
  ensureRoom(SECTION_TOP_GAP + provHeight + SECTION_BOTTOM_GAP);
  sectionLabel(renderer, "Provenance", cursor.y);
  drawFieldGrid(renderer, cursor.y + SECTION_TOP_GAP, provFields, 3);
  cursor.advance(SECTION_TOP_GAP + provHeight + SECTION_BOTTOM_GAP);

  // Valuation
  const basisLabel = { receipt: "Receipt", appraisal: "Appraisal", owner_estimate: "Owner estimate" };
  const valFields = [
    {
      label: "Declared value",
      value: watch.declared_value != null ? formatCurrency(watch.declared_value, watch.purchase_currency) : "—",
      mono: true,
    },
    { label: "Valuation date", value: watch.declared_value_date || "—", mono: true },
    { label: "Basis", value: watch.valuation_basis ? basisLabel[watch.valuation_basis] : "—" },
  ];
  const valHeight = fieldGridHeight(valFields.length, 3);
  ensureRoom(SECTION_TOP_GAP + valHeight + SECTION_BOTTOM_GAP);
  sectionLabel(renderer, "Valuation", cursor.y);
  drawFieldGrid(renderer, cursor.y + SECTION_TOP_GAP, valFields, 3);
  cursor.advance(SECTION_TOP_GAP + valHeight + SECTION_BOTTOM_GAP);

  // Condition notes
  const notesText = watch.condition_notes.trim() || "—";
  const noteLines = wrapText(notesText, CONTENT_WIDTH, { size: 10, font: "sans" }, (t, o) =>
    renderer.measureTextWidth(t, o),
  );
  const NOTE_LINE_H = 12;
  const notesHeight = SECTION_TOP_GAP + noteLines.length * NOTE_LINE_H + SECTION_BOTTOM_GAP;
  ensureRoom(notesHeight);
  sectionLabel(renderer, "Condition notes", cursor.y);
  let noteY = cursor.y + SECTION_TOP_GAP;
  for (const line of noteLines) {
    renderer.drawText(line, MARGIN, noteY, { size: 10, font: "sans", maxWidth: CONTENT_WIDTH });
    noteY += NOTE_LINE_H;
  }
  cursor.advance(notesHeight);

  // Photo grid — atomic block: the whole grid moves together, never splits mid-grid
  const cellGap = 8;
  const cellW = (CONTENT_WIDTH - 2 * cellGap) / 3;
  const cellPhotoH = 85;
  const cellCaptionH = 12;
  const gridRowGap = 8;
  const gridRowH = cellPhotoH + cellCaptionH;
  const gridHeight = SECTION_TOP_GAP + 2 * gridRowH + gridRowGap + SECTION_BOTTOM_GAP;
  ensureRoom(gridHeight);
  sectionLabel(renderer, "Photographs", cursor.y);
  const gridTop = cursor.y + SECTION_TOP_GAP;
  const photosByType = new Map(photos.map((p) => [p.shot_type, p]));
  for (let i = 0; i < GRID_SHOT_TYPES.length; i++) {
    const { type, caption } = GRID_SHOT_TYPES[i];
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cx = MARGIN + col * (cellW + cellGap);
    const cy = gridTop + row * (gridRowH + gridRowGap);
    const photo = photosByType.get(type);
    if (photo) {
      await renderer.drawImage(photo.blob_full, cx, cy, cellW, cellPhotoH);
    } else {
      renderer.drawRect(cx, cy, cellW, cellPhotoH, { stroke: RULE, strokeWidth: 1 });
      renderer.drawText("Not photographed", cx + cellW / 2, cy + cellPhotoH / 2, {
        size: 8,
        font: "sans",
        color: INK_MUTED,
        align: "center",
      });
    }
    renderer.drawText(caption, cx + cellW / 2, cy + cellPhotoH + 9, {
      size: 8,
      font: "sans",
      color: INK_MUTED,
      align: "center",
    });
  }
  cursor.advance(gridHeight);

  // Attached documents — only the label + first row need to fit up front;
  // additional rows are paginated individually in the loop below.
  const docRowH = 14;
  ensureRoom(SECTION_TOP_GAP + docRowH + SECTION_BOTTOM_GAP);
  sectionLabel(renderer, "Attached documents", cursor.y);
  let docY = cursor.y + SECTION_TOP_GAP;
  cursor.advance(SECTION_TOP_GAP);
  if (documents.length === 0) {
    renderer.drawText("None attached.", MARGIN, docY, { size: 9, font: "sans", color: INK_MUTED });
    cursor.advance(docRowH);
  } else {
    for (const doc of documents) {
      if (cursor.wouldOverflow(docRowH)) {
        cursor.breakPage(renderer, header);
        docY = cursor.y;
      }
      renderer.drawText(
        `${DOC_TYPE_LABEL[doc.doc_type]} — ${doc.file_name}${doc.issued_date ? `  (${doc.issued_date})` : ""}`,
        MARGIN,
        docY,
        { size: 9, font: "sans", maxWidth: CONTENT_WIDTH },
      );
      docY += docRowH;
      cursor.advance(docRowH);
    }
  }
}
