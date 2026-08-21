import { Geist, Geist_Mono } from "next/font/google";

/**
 * Instantiated exactly once and shared between app/layout.tsx (CSS variable
 * wiring) and the canvas layout renderer (`.style.fontFamily` fed to
 * `ctx.font`). Calling `Geist(...)` again in a second file would create a
 * second font-loader instance with its own generated family name — not
 * actually the same font as the rest of the UI.
 */
export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Canvas's `ctx.font = "bold ..."` isn't guaranteed to resolve to a visibly
 * bold weight against a variable font loaded this way. This explicit
 * weight-700 instance is the fallback if that check fails.
 */
export const geistSansBold = Geist({
  weight: "700",
  subsets: ["latin"],
});
