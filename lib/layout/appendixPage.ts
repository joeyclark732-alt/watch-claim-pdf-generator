import type { DocumentRecord, WatchRecord } from "@/lib/db";
import { PAGE_HEIGHT_PT, PAGE_WIDTH_PT, type PageRenderer } from "./renderer";
import { INK_MUTED, OXBLOOD, RULE } from "./theme";

const MARGIN = 54;
const CONTENT_WIDTH = PAGE_WIDTH_PT - 2 * MARGIN;

const DOC_TYPE_LABEL: Record<DocumentRecord["doc_type"], string> = {
  receipt: "Receipt",
  warranty_card: "Warranty card",
  appraisal: "Appraisal",
  service_record: "Service record",
  authentication: "Authentication",
  policy_document: "Policy document",
  other: "Other",
};

function drawCaption(
  renderer: PageRenderer,
  watch: WatchRecord,
  doc: DocumentRecord,
  pageLabel?: string,
): number {
  const title = `${watch.brand} ${watch.model_name}`.trim() || "Watch";
  renderer.drawText(title, MARGIN, 60, { size: 10, font: "serif" });
  const subtitle = [
    DOC_TYPE_LABEL[doc.doc_type],
    doc.issued_date,
    pageLabel,
  ]
    .filter(Boolean)
    .join("  ·  ");
  renderer.drawText(subtitle, MARGIN, 74, { size: 9, font: "sans", color: INK_MUTED });
  // The one sanctioned use of oxblood in the exported PDF: the rule under
  // each attached document's own caption header in the appendix.
  renderer.drawLine(MARGIN, 84, PAGE_WIDTH_PT - MARGIN, 84, { color: OXBLOOD, width: 1.5 });
  return 96;
}

function drawPlaceholder(renderer: PageRenderer, top: number, bottom: number, fileName: string): void {
  const boxH = bottom - top;
  renderer.drawRect(MARGIN, top, CONTENT_WIDTH, boxH, { stroke: RULE, strokeWidth: 1 });
  const center = top + boxH / 2;
  renderer.drawText(fileName, PAGE_WIDTH_PT / 2, center - 10, {
    size: 11,
    font: "sansMedium",
    align: "center",
    maxWidth: CONTENT_WIDTH - 40,
  });
  renderer.drawText(
    "PDF document — included in full in the exported claim file.",
    PAGE_WIDTH_PT / 2,
    center + 8,
    { size: 9, font: "sans", color: INK_MUTED, align: "center" },
  );
}

/**
 * Full-page reproduction per attached document, ordered by item then by
 * document within item. Image documents render contain-fit.
 *
 * PDF documents: when the renderer supports it (PdfRenderer, not
 * CanvasRenderer), every source page gets its own appendix page — a
 * 3-page appraisal PDF produces 3 appendix pages, not 1 — via
 * getPdfPageCount/drawPdfPage. The canvas preview doesn't implement those
 * (rasterizing a PDF would need a new dependency for a preview-only
 * concern), so it falls back to a single placeholder page, same as before.
 * A source PDF that fails to load (encrypted, corrupted) falls back to the
 * placeholder for that one document only — one bad attachment can't fail
 * the whole export.
 */
export async function renderAppendix(
  renderer: PageRenderer,
  items: { watch: WatchRecord; documents: DocumentRecord[] }[],
): Promise<void> {
  for (const { watch, documents } of items) {
    for (const doc of documents) {
      if (doc.mime_type.startsWith("image/")) {
        renderer.addPage(PAGE_WIDTH_PT, PAGE_HEIGHT_PT);
        const top = drawCaption(renderer, watch, doc);
        await renderer.drawImage(doc.blob, MARGIN, top, CONTENT_WIDTH, PAGE_HEIGHT_PT - MARGIN - top);
        continue;
      }

      let pageCount = 1;
      let embedFailed = false;
      if (renderer.getPdfPageCount) {
        try {
          pageCount = await renderer.getPdfPageCount(doc.blob);
        } catch {
          embedFailed = true;
        }
      }

      for (let i = 0; i < pageCount; i++) {
        renderer.addPage(PAGE_WIDTH_PT, PAGE_HEIGHT_PT);
        const pageLabel = pageCount > 1 ? `page ${i + 1} of ${pageCount}` : undefined;
        const top = drawCaption(renderer, watch, doc, pageLabel);
        const bottom = PAGE_HEIGHT_PT - MARGIN;

        if (!embedFailed && renderer.drawPdfPage) {
          try {
            await renderer.drawPdfPage(doc.blob, i, MARGIN, top, CONTENT_WIDTH, bottom - top);
            continue;
          } catch {
            // Fall through to the placeholder for this page.
          }
        }
        drawPlaceholder(renderer, top, bottom, doc.file_name);
      }
    }
  }
}
