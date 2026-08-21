import type { DocumentRecord, WatchRecord } from "@/lib/db";
import { PAGE_HEIGHT_PT, PAGE_WIDTH_PT, type PageRenderer } from "./renderer";
import { INK_MUTED, LINE } from "./theme";

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

function drawCaption(renderer: PageRenderer, watch: WatchRecord, doc: DocumentRecord): number {
  const title = `${watch.brand} ${watch.model_name}`.trim() || "Watch";
  renderer.drawText(title, MARGIN, 60, { size: 10, font: "sansBold" });
  renderer.drawText(
    `${DOC_TYPE_LABEL[doc.doc_type]}${doc.issued_date ? `  ·  ${doc.issued_date}` : ""}`,
    MARGIN,
    74,
    { size: 9, font: "sans", color: INK_MUTED },
  );
  renderer.drawLine(MARGIN, 84, PAGE_WIDTH_PT - MARGIN, 84, { color: LINE });
  return 96;
}

/**
 * Full-page reproduction per attached document, ordered by item then by
 * document within item. Image documents render contain-fit. PDF documents
 * get a placeholder this phase — canvas can't rasterize a PDF's actual
 * pages without a new dependency (pdf.js), and week 4's real export embeds
 * the source PDF pages natively via pdf-lib, which gives better fidelity
 * than a rasterized preview would anyway.
 */
export async function renderAppendix(
  renderer: PageRenderer,
  items: { watch: WatchRecord; documents: DocumentRecord[] }[],
): Promise<void> {
  for (const { watch, documents } of items) {
    for (const doc of documents) {
      renderer.addPage(PAGE_WIDTH_PT, PAGE_HEIGHT_PT);
      const top = drawCaption(renderer, watch, doc);
      const bottom = PAGE_HEIGHT_PT - MARGIN;

      if (doc.mime_type.startsWith("image/")) {
        await renderer.drawImage(doc.blob, MARGIN, top, CONTENT_WIDTH, bottom - top);
      } else {
        const boxH = bottom - top;
        renderer.drawRect(MARGIN, top, CONTENT_WIDTH, boxH, { stroke: LINE, strokeWidth: 1 });
        const center = top + boxH / 2;
        renderer.drawText(doc.file_name, PAGE_WIDTH_PT / 2, center - 10, {
          size: 11,
          font: "sansBold",
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
    }
  }
}
