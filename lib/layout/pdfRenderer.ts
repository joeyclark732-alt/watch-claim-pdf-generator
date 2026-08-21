import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type Color, type PDFFont, type PDFPage } from "pdf-lib";
import { containFit } from "./imageFit";
import type { FontKey, ImageOptions, LineOptions, PageRenderer, RectOptions, TextOptions } from "./renderer";
import { INK } from "./theme";
import { truncateToFit } from "./truncateText";

const FONT_PATHS: Record<FontKey, string> = {
  sans: "/fonts/Geist-Regular.ttf",
  sansBold: "/fonts/Geist-Bold.ttf",
  mono: "/fonts/GeistMono-Regular.ttf",
};

function hexToColor(hex: string): Color {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return rgb(r, g, b);
}

async function fetchFontBytes(path: string): Promise<ArrayBuffer> {
  // Same-origin static asset, fetched at PDF-generation time -- not a
  // runtime call to any third party, so it doesn't touch the CSP or the
  // "nothing leaves this device" promise, same as any other bundled asset.
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Could not load font: ${path}`);
  return res.arrayBuffer();
}

/**
 * pdf-lib is bottom-left-origin, y-up; our interface is top-left-origin,
 * y-down (matches Canvas natively). Text uses baseline convention in both
 * APIs, so the flip is the simple `pageHeight - y`. Rects/images are
 * anchored by their top-left corner in our interface but by their
 * bottom-left corner in pdf-lib, so that flip is `pageHeight - (y + h)` —
 * getting this wrong wouldn't error, it would just silently misplace
 * everything, which is why it's called out explicitly here and checked
 * visually in verification rather than trusted from a code read alone.
 */
export class PdfRenderer implements PageRenderer {
  private readonly doc: PDFDocument;
  private readonly fonts: Record<FontKey, PDFFont>;
  private readonly pages: PDFPage[] = [];
  private current: PDFPage | null = null;

  private constructor(doc: PDFDocument, fonts: Record<FontKey, PDFFont>) {
    this.doc = doc;
    this.fonts = fonts;
  }

  static async create(): Promise<PdfRenderer> {
    const doc = await PDFDocument.create();
    doc.registerFontkit(fontkit);

    const keys = Object.keys(FONT_PATHS) as FontKey[];
    const bytes = await Promise.all(keys.map((k) => fetchFontBytes(FONT_PATHS[k])));
    // Ligatures (Geist has a "tt" ligature, among others) render fine but
    // aren't reliably reverse-mapped when text is extracted or copied from
    // the PDF -- confirmed by testing, "attached" copies out corrupted with
    // the default features. This is a spec-sheet document meant to be
    // searched and copied from, not display typography, so ligatures and
    // other substitutions are disabled outright.
    const embedded = await Promise.all(
      bytes.map((b) =>
        doc.embedFont(b, {
          features: { liga: false, clig: false, calt: false, dlig: false },
        }),
      ),
    );
    const fonts = Object.fromEntries(keys.map((k, i) => [k, embedded[i]])) as Record<
      FontKey,
      PDFFont
    >;

    return new PdfRenderer(doc, fonts);
  }

  private get page(): PDFPage {
    if (!this.current) throw new Error("No current page — call addPage() first.");
    return this.current;
  }

  addPage(widthPt: number, heightPt: number): void {
    const page = this.doc.addPage([widthPt, heightPt]);
    this.pages.push(page);
    this.current = page;
  }

  selectPage(index: number): void {
    const page = this.pages[index];
    if (!page) throw new Error(`Page index ${index} out of range.`);
    this.current = page;
  }

  pageCount(): number {
    return this.pages.length;
  }

  drawText(text: string, x: number, y: number, opts: TextOptions): void {
    const page = this.page;
    const font = this.fonts[opts.font];
    const color = hexToColor(opts.color ?? INK);
    const pageHeight = page.getSize().height;

    const rendered =
      opts.maxWidth !== undefined
        ? truncateToFit(text, opts.maxWidth, (t) => font.widthOfTextAtSize(t, opts.size))
        : text;

    let drawX = x;
    if (opts.align === "center" || opts.align === "right") {
      const width = font.widthOfTextAtSize(rendered, opts.size);
      drawX = opts.align === "center" ? x - width / 2 : x - width;
    }

    page.drawText(rendered, { x: drawX, y: pageHeight - y, size: opts.size, font, color });
  }

  measureTextWidth(text: string, opts: { size: number; font: FontKey }): number {
    return this.fonts[opts.font].widthOfTextAtSize(text, opts.size);
  }

  drawRect(x: number, y: number, w: number, h: number, opts: RectOptions): void {
    const page = this.page;
    const pageHeight = page.getSize().height;
    page.drawRectangle({
      x,
      y: pageHeight - (y + h),
      width: w,
      height: h,
      color: opts.fill ? hexToColor(opts.fill) : undefined,
      borderColor: opts.stroke ? hexToColor(opts.stroke) : undefined,
      borderWidth: opts.stroke ? (opts.strokeWidth ?? 1) : undefined,
    });
  }

  drawLine(x1: number, y1: number, x2: number, y2: number, opts: LineOptions): void {
    const page = this.page;
    const pageHeight = page.getSize().height;
    page.drawLine({
      start: { x: x1, y: pageHeight - y1 },
      end: { x: x2, y: pageHeight - y2 },
      thickness: opts.width ?? 1,
      color: hexToColor(opts.color ?? INK),
    });
  }

  async drawImage(
    blob: Blob,
    x: number,
    y: number,
    w: number,
    h: number,
    opts?: ImageOptions,
  ): Promise<void> {
    const page = this.page;
    const pageHeight = page.getSize().height;
    const bytes = await blob.arrayBuffer();
    // Every image reaching a renderer has already been re-encoded to JPEG by
    // lib/images/process.ts, but checking the type is cheap and more robust
    // than assuming it.
    const image =
      blob.type === "image/png" ? await this.doc.embedPng(bytes) : await this.doc.embedJpg(bytes);

    if (opts?.fit === "stretch") {
      page.drawImage(image, { x, y: pageHeight - (y + h), width: w, height: h });
    } else {
      const fit = containFit(image.width, image.height, w, h);
      page.drawImage(image, {
        x: x + fit.x,
        y: pageHeight - (y + fit.y + fit.h),
        width: fit.w,
        height: fit.h,
      });
    }
  }

  async getPdfPageCount(blob: Blob): Promise<number> {
    const src = await PDFDocument.load(await blob.arrayBuffer());
    return src.getPageCount();
  }

  async drawPdfPage(
    blob: Blob,
    pageIndex: number,
    x: number,
    y: number,
    w: number,
    h: number,
  ): Promise<void> {
    const page = this.page;
    const pageHeight = page.getSize().height;
    const src = await PDFDocument.load(await blob.arrayBuffer());
    const [embedded] = await this.doc.embedPdf(src, [pageIndex]);
    const fit = containFit(embedded.width, embedded.height, w, h);
    page.drawPage(embedded, {
      x: x + fit.x,
      y: pageHeight - (y + fit.y + fit.h),
      width: fit.w,
      height: fit.h,
    });
  }

  async save(): Promise<Uint8Array> {
    return this.doc.save();
  }
}

export async function createPdfRenderer(): Promise<PdfRenderer> {
  return PdfRenderer.create();
}
