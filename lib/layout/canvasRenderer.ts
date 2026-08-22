import { geistMono, geistSans, geistSansBold } from "@/lib/fonts";
import { containFit } from "./imageFit";
import type { ImageOptions, LineOptions, PageRenderer, RectOptions, TextOptions } from "./renderer";
import { INK, PAPER } from "./theme";
import { truncateToFit } from "./truncateText";

/** Rendered at 2x for a crisp preview; layout math stays in points throughout. */
const SCALE = 2;

function fontFamily(font: TextOptions["font"]): string {
  switch (font) {
    case "sans":
      return geistSans.style.fontFamily;
    case "sansBold":
      return geistSansBold.style.fontFamily;
    case "mono":
      return geistMono.style.fontFamily;
  }
}

function cssFont(opts: { size: number; font: TextOptions["font"] }): string {
  const weight = opts.font === "sansBold" ? "700 " : "";
  return `${weight}${opts.size}px ${fontFamily(opts.font)}`;
}

export class CanvasRenderer implements PageRenderer {
  readonly pages: HTMLCanvasElement[] = [];
  private contexts: CanvasRenderingContext2D[] = [];
  private currentIndex = -1;
  private readonly scratch: CanvasRenderingContext2D;

  constructor() {
    const scratchCanvas = document.createElement("canvas");
    const ctx = scratchCanvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable.");
    this.scratch = ctx;
  }

  private get ctx(): CanvasRenderingContext2D {
    const ctx = this.contexts[this.currentIndex];
    if (!ctx) throw new Error("No current page — call addPage() first.");
    return ctx;
  }

  addPage(widthPt: number, heightPt: number): void {
    const canvas = document.createElement("canvas");
    canvas.width = widthPt * SCALE;
    canvas.height = heightPt * SCALE;
    canvas.style.width = `${widthPt}px`;
    canvas.style.height = `${heightPt}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable.");
    ctx.scale(SCALE, SCALE);
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, widthPt, heightPt);
    this.pages.push(canvas);
    this.contexts.push(ctx);
    this.currentIndex = this.pages.length - 1;
  }

  selectPage(index: number): void {
    if (index < 0 || index >= this.pages.length) {
      throw new Error(`Page index ${index} out of range.`);
    }
    this.currentIndex = index;
  }

  pageCount(): number {
    return this.pages.length;
  }

  drawText(text: string, x: number, y: number, opts: TextOptions): void {
    const ctx = this.ctx;
    ctx.font = cssFont(opts);
    ctx.fillStyle = opts.color ?? INK;
    ctx.textBaseline = "alphabetic";
    const rendered =
      opts.maxWidth !== undefined
        ? truncateToFit(text, opts.maxWidth, (t) => ctx.measureText(t).width)
        : text;

    let drawX = x;
    if (opts.align === "center" || opts.align === "right") {
      const width = ctx.measureText(rendered).width;
      drawX = opts.align === "center" ? x - width / 2 : x - width;
    }
    ctx.fillText(rendered, drawX, y);
  }

  measureTextWidth(
    text: string,
    opts: { size: number; font: TextOptions["font"] },
  ): number {
    this.scratch.font = cssFont(opts);
    return this.scratch.measureText(text).width;
  }

  drawRect(x: number, y: number, w: number, h: number, opts: RectOptions): void {
    const ctx = this.ctx;
    if (opts.fill) {
      ctx.fillStyle = opts.fill;
      ctx.fillRect(x, y, w, h);
    }
    if (opts.stroke) {
      ctx.strokeStyle = opts.stroke;
      ctx.lineWidth = opts.strokeWidth ?? 1;
      ctx.strokeRect(x, y, w, h);
    }
  }

  drawLine(x1: number, y1: number, x2: number, y2: number, opts: LineOptions): void {
    const ctx = this.ctx;
    ctx.strokeStyle = opts.color ?? INK;
    ctx.lineWidth = opts.width ?? 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  async drawImage(
    blob: Blob,
    x: number,
    y: number,
    w: number,
    h: number,
    opts?: ImageOptions,
  ): Promise<void> {
    const ctx = this.ctx;
    // Blobs reaching here are already EXIF-stripped/re-encoded (lib/images/process.ts),
    // orientation already baked into the pixels — no imageOrientation option needed.
    const bitmap = await createImageBitmap(blob);
    try {
      if (opts?.fit === "stretch") {
        ctx.drawImage(bitmap, x, y, w, h);
      } else {
        const fit = containFit(bitmap.width, bitmap.height, w, h);
        ctx.drawImage(bitmap, x + fit.x, y + fit.y, fit.w, fit.h);
      }
    } finally {
      bitmap.close();
    }
  }
}
