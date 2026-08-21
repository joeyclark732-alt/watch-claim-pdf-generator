/**
 * Trims to fit maxWidth with an ellipsis — never a native squish. Shared by
 * both renderers so canvas and pdf-lib truncate identically instead of each
 * implementing the same binary search against their own measurement API.
 */
export function truncateToFit(
  text: string,
  maxWidth: number,
  measureWidth: (text: string) => number,
): string {
  if (measureWidth(text) <= maxWidth) return text;
  const ellipsis = "…";
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    const candidate = text.slice(0, mid) + ellipsis;
    if (measureWidth(candidate) <= maxWidth) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return lo === 0 ? ellipsis : text.slice(0, lo) + ellipsis;
}
