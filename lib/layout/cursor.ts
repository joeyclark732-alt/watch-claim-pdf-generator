import { PAGE_HEIGHT_PT, PAGE_WIDTH_PT, type PageRenderer } from "./renderer";

/**
 * Shared y-position tracker for page composers that lay out a variable
 * amount of content top-to-bottom and need to break to a new page (with a
 * repeated header) when it overflows. Used by the summary schedule, the
 * item page's document list, the item page's overall block flow, and the
 * appendix — four consumers is enough that a shared implementation is worth
 * it instead of four copies that could quietly diverge.
 */
export interface PageCursor {
  readonly y: number;
  wouldOverflow(amount: number): boolean;
  advance(amount: number): void;
  /** Adds a new page, invokes onNewPage to redraw a repeated header, and resumes the cursor at the y it returns. */
  breakPage(renderer: PageRenderer, onNewPage: () => number): void;
}

export function createPageCursor(
  startY: number,
  bottomMarginPt = 54,
): PageCursor {
  let y = startY;
  return {
    get y() {
      return y;
    },
    wouldOverflow(amount: number) {
      return y + amount > PAGE_HEIGHT_PT - bottomMarginPt;
    },
    advance(amount: number) {
      y += amount;
    },
    breakPage(renderer: PageRenderer, onNewPage: () => number) {
      renderer.addPage(PAGE_WIDTH_PT, PAGE_HEIGHT_PT);
      y = onNewPage();
    },
  };
}
