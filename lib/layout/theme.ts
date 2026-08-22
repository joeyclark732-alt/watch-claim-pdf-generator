/**
 * Same palette as app/globals.css's :root tokens. Canvas fillStyle doesn't
 * resolve CSS custom properties, so the hex values are duplicated here
 * rather than read from the DOM. Always the light values, deliberately —
 * the exported document is a fixed physical artifact, not a themed surface,
 * so it doesn't follow the viewer's OS dark-mode preference.
 */
export const PAPER = "#faf7f0";
export const PAPER_SUNK = "#ede7da";
export const RULE = "#ddd5c4";
export const INK_MUTED = "#8a8272";
export const INK_BODY = "#6b6355";
export const INK = "#1a1815";
export const OXBLOOD = "#6e1e22";
