/**
 * Original line-art watch face — no photography, no licensing surface.
 * Hands posed at 10:10, the standard watch-photography angle (frames the
 * dial symmetrically and reads as a small smile).
 */
export function WatchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="100" cy="100" r="78" stroke="currentColor" strokeWidth="2" />
      <circle cx="100" cy="100" r="68" stroke="currentColor" strokeWidth="1" opacity="0.5" />

      {/* cardinal ticks */}
      <line x1="100" y1="34" x2="100" y2="44" stroke="currentColor" strokeWidth="2" />
      <line x1="100" y1="156" x2="100" y2="166" stroke="currentColor" strokeWidth="2" />
      <line x1="34" y1="100" x2="44" y2="100" stroke="currentColor" strokeWidth="2" />
      <line x1="156" y1="100" x2="166" y2="100" stroke="currentColor" strokeWidth="2" />

      {/* minor ticks */}
      {[30, 60, 120, 150, 210, 240, 300, 330].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 100 + 62 * Math.sin(rad);
        const y1 = 100 - 62 * Math.cos(rad);
        const x2 = 100 + 68 * Math.sin(rad);
        const y2 = 100 - 68 * Math.cos(rad);
        return (
          <line
            key={deg}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.6"
          />
        );
      })}

      {/* hands at 10:10 */}
      <line x1="100" y1="100" x2="69" y2="78" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <line x1="100" y1="100" x2="145" y2="74" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="100" cy="100" r="3.5" fill="currentColor" />

      {/* crown */}
      <rect x="177" y="93" width="13" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
