import type { PageRenderer } from "./renderer";
import { INK, OXBLOOD, RULE } from "./theme";

/**
 * Concentric rings with tick marks at the quarters and an oxblood centre —
 * the same mark as components/Seal.tsx, redrawn with primitives since
 * neither renderer can render an SVG. Geometry is proportional to that
 * component's 52x52 viewBox, so it scales cleanly to any point size.
 */
export function drawSeal(renderer: PageRenderer, cx: number, cy: number, size: number): void {
  const scale = size / 52;
  const s = (v: number) => v * scale;

  renderer.drawCircle(cx, cy, s(24), { stroke: INK, strokeWidth: s(1) });
  renderer.drawCircle(cx, cy, s(18), { stroke: RULE, strokeWidth: s(1) });

  const ticks: [number, number, number, number][] = [
    [0, -24, 0, -17],
    [24, 0, 17, 0],
    [0, 24, 0, 17],
    [-24, 0, -17, 0],
  ];
  for (const [dx1, dy1, dx2, dy2] of ticks) {
    renderer.drawLine(cx + s(dx1), cy + s(dy1), cx + s(dx2), cy + s(dy2), {
      color: INK,
      width: s(1.5),
    });
  }

  renderer.drawCircle(cx, cy, s(6), { fill: OXBLOOD });
}
