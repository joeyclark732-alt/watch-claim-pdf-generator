import type { FontKey } from "./renderer";

/**
 * Word-wrap decided once, here, in shared code — not inside either renderer
 * — so canvas and a future pdf-lib renderer wrap identically instead of
 * each engine making its own (possibly divergent) call. Mono text is immune
 * to any measurement drift between the two engines since monospace advance
 * widths are uniform by construction; proportional (sans) text is where
 * Canvas's `measureText` and pdf-lib's `widthOfTextAtSize` could disagree
 * slightly, since they go through different font-shaping engines.
 */
export function wrapText(
  text: string,
  maxWidth: number,
  fontOpts: { size: number; font: FontKey },
  measureTextWidth: (text: string, opts: { size: number; font: FontKey }) => number,
): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      continue;
    }
    let current = words[0];
    for (const word of words.slice(1)) {
      const candidate = `${current} ${word}`;
      if (measureTextWidth(candidate, fontOpts) <= maxWidth) {
        current = candidate;
      } else {
        lines.push(current);
        current = word;
      }
    }
    lines.push(current);
  }
  return lines;
}
