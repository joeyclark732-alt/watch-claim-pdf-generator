import { PAGE_HEIGHT_PT, PAGE_WIDTH_PT, type PageRenderer } from "./renderer";
import { drawSeal } from "./seal";
import { INK_MUTED } from "./theme";

const MARGIN = 54;
const SEAL_SIZE = 12;

/**
 * Pure — no "total pages" baked in here. document.ts runs this in a second
 * pass, once every content page exists and the true total is known, via
 * renderer.selectPage(i). "These get filed and separated, so every page
 * must stand alone" (spec §6) — hence generated date + owner name repeated
 * on every single page, not just the cover.
 */
export function drawFooter(
  renderer: PageRenderer,
  pageIndex: number,
  totalPages: number,
  data: { generatedDate: string; ownerName: string },
): void {
  const y = PAGE_HEIGHT_PT - 30;
  drawSeal(renderer, MARGIN + SEAL_SIZE / 2, y - 3, SEAL_SIZE);
  renderer.drawText(`Generated ${data.generatedDate}`, MARGIN + SEAL_SIZE + 6, y, {
    size: 8,
    font: "mono",
    color: INK_MUTED,
  });
  renderer.drawText(data.ownerName, PAGE_WIDTH_PT / 2, y, {
    size: 8,
    font: "mono",
    color: INK_MUTED,
    align: "center",
  });
  renderer.drawText(`Page ${pageIndex + 1} of ${totalPages}`, PAGE_WIDTH_PT - MARGIN, y, {
    size: 8,
    font: "mono",
    color: INK_MUTED,
    align: "right",
  });
}
