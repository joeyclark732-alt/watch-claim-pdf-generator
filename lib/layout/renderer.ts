export const PAGE_WIDTH_PT = 612; // US Letter, 72pt/inch
export const PAGE_HEIGHT_PT = 792;

export type FontKey = "serif" | "sans" | "sansMedium" | "mono";

export interface TextOptions {
  size: number;
  font: FontKey;
  color?: string;
  align?: "left" | "center" | "right";
  /**
   * Single-line truncate-with-ellipsis ONLY. Canvas's native
   * `fillText(text, x, y, maxWidth)` squishes glyphs to fit rather than
   * wrapping — that behavior must never leak through this interface.
   * Multi-line text goes through `wrapText()` and multiple `drawText` calls.
   */
  maxWidth?: number;
  /**
   * Extra space between characters, in em (fraction of `size`). Reserved
   * for the label/caption text style (11px, tracked 0.08em) — body text
   * never sets this.
   */
  tracking?: number;
}

export interface RectOptions {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface CircleOptions {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface LineOptions {
  color?: string;
  width?: number;
}

export interface ImageOptions {
  /** Scale-to-fit + center, never warp. Default 'contain'. */
  fit?: "contain" | "stretch";
}

/**
 * Thin imperative drawing surface, deliberately not a declarative document
 * model — Canvas 2D and pdf-lib are both already low-level imperative APIs
 * at a similar altitude, so a heavier abstraction would solve a problem
 * that doesn't exist. Coordinates are points (72/in), top-left origin,
 * y-down (matches Canvas natively; a future pdf-lib implementation flips y
 * internally against its bottom-left/y-up convention).
 */
export interface PageRenderer {
  addPage(widthPt: number, heightPt: number): void;
  /** For the footer's second pass, after every content page already exists. */
  selectPage(index: number): void;
  pageCount(): number;
  drawText(text: string, x: number, y: number, opts: TextOptions): void;
  /**
   * Must work before any addPage() call — pagination decisions ("does this
   * row fit?") happen before a draw is committed, not after.
   */
  measureTextWidth(text: string, opts: Omit<TextOptions, "align" | "maxWidth">): number;
  drawRect(x: number, y: number, w: number, h: number, opts: RectOptions): void;
  drawCircle(cx: number, cy: number, r: number, opts: CircleOptions): void;
  drawLine(x1: number, y1: number, x2: number, y2: number, opts: LineOptions): void;
  drawImage(
    blob: Blob,
    x: number,
    y: number,
    w: number,
    h: number,
    opts?: ImageOptions,
  ): Promise<void>;
  /**
   * Optional — only PdfRenderer implements these, for embedding real pages
   * from a PDF-type document attachment (spec: "full-page reproductions of
   * every attached document"). CanvasRenderer omits them; appendixPage.ts
   * falls back to a page count of 1 and its placeholder page when absent,
   * so the canvas preview is unaffected either way.
   */
  getPdfPageCount?(blob: Blob): Promise<number>;
  drawPdfPage?(
    blob: Blob,
    pageIndex: number,
    x: number,
    y: number,
    w: number,
    h: number,
  ): Promise<void>;
}
