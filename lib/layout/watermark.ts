import { PAGE_HEIGHT_PT, PAGE_WIDTH_PT } from "./renderer";
import { INK } from "./theme";

/**
 * Deliberately not part of PageRenderer or any composer — the real PDF
 * (week 4) never has this, so the layout code stays reusable as-is. Applied
 * as a final pass directly on each finished canvas: a semi-transparent
 * diagonal repeated stamp, drawn last, on top of everything. The canvas
 * already has its point-space scale transform applied from addPage(), so
 * re-fetching its 2D context here and drawing in PAGE_WIDTH_PT/PAGE_HEIGHT_PT
 * coordinates lines up with everything the renderer already drew.
 */
export function applyPreviewWatermark(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = INK;
  ctx.font = "48px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.translate(PAGE_WIDTH_PT / 2, PAGE_HEIGHT_PT / 2);
  ctx.rotate(-Math.PI / 6);
  for (let y = -PAGE_HEIGHT_PT; y < PAGE_HEIGHT_PT * 1.5; y += 130) {
    for (let x = -PAGE_WIDTH_PT; x < PAGE_WIDTH_PT * 1.5; x += 230) {
      ctx.fillText("PREVIEW", x, y);
    }
  }
  ctx.restore();
}
