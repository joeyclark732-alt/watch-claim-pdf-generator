import { Instrument_Serif, JetBrains_Mono, Public_Sans } from "next/font/google";

/**
 * Instantiated exactly once and shared between app/layout.tsx (CSS variable
 * wiring) and the canvas layout renderer (`.style.fontFamily` fed to
 * `ctx.font`). Calling a loader again in a second file would create a
 * second font-loader instance with its own generated family name — not
 * actually the same font as the rest of the UI.
 *
 * Three families, one job each: Instrument Serif for the wordmark, the
 * landing headline, and PDF document headings — never in the interface.
 * Public Sans for all interface text. JetBrains Mono for every figure
 * (serials, references, prices, dates, page numbers, scores) without
 * exception. Two weights only, 400 and 500 — no bold, no light.
 */
export const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const publicSans = Public_Sans({
  variable: "--font-public-sans",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

/**
 * Canvas's `ctx.font = "500 ..."` isn't guaranteed to resolve to a visibly
 * medium weight against a variable font loaded this way. These explicit
 * single-weight instances are the fallback if that check fails.
 */
export const publicSansMedium = Public_Sans({
  weight: "500",
  subsets: ["latin"],
});

export const jetbrainsMonoMedium = JetBrains_Mono({
  weight: "500",
  subsets: ["latin"],
});
