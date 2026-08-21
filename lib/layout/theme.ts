/**
 * Same palette as app/globals.css's :root tokens. Canvas fillStyle doesn't
 * resolve CSS custom properties, so the hex values are duplicated here
 * rather than read from the DOM — this is fine since the palette is a
 * deliberate fixed light-only design (see Phase 1), not theme-dependent.
 */
export const INK = "#1c1a17";
export const INK_MUTED = "#6b6558";
export const LINE = "#d8d3c7";
export const PAPER = "#f7f5f0";
export const ACCENT = "#7a5c2e";
