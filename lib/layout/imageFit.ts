/** Scale-to-fit an image inside a box, centered, preserving aspect ratio. */
export function containFit(
  imgWidth: number,
  imgHeight: number,
  boxWidth: number,
  boxHeight: number,
): { x: number; y: number; w: number; h: number } {
  const scale = Math.min(boxWidth / imgWidth, boxHeight / imgHeight);
  const w = imgWidth * scale;
  const h = imgHeight * scale;
  return {
    x: (boxWidth - w) / 2,
    y: (boxHeight - h) / 2,
    w,
    h,
  };
}
