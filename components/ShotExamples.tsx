import type { ShotType } from "@/lib/db";
import { WatchIcon } from "./WatchIcon";

/**
 * Original line-art diagrams, one per checklist shot — same reasoning as
 * WatchIcon: no photography, no licensing surface, and it keeps every
 * illustration in the app rendering identically regardless of device or
 * network. Each is a schematic of framing/angle, not a literal photo.
 */

function DialExample({ className }: { className?: string }) {
  return <WatchIcon className={className} />;
}

function CasebackExample({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className}>
      <circle cx="100" cy="100" r="78" stroke="currentColor" strokeWidth="2" />
      <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      {[0, 90, 180, 270].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x = 100 + 69 * Math.sin(rad);
        const y = 100 - 69 * Math.cos(rad);
        return <circle key={deg} cx={x} cy={y} r="2.5" fill="currentColor" />;
      })}
      <rect x="70" y="94" width="60" height="24" stroke="currentColor" strokeWidth="1.5" />
      <line x1="78" y1="102" x2="122" y2="102" stroke="currentColor" strokeWidth="1.5" />
      <line x1="78" y1="110" x2="112" y2="110" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function SerialMacroExample({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className}>
      {/* corner crop brackets signal close-up framing */}
      {[
        [30, 30, 30, 46, 46, 30],
        [170, 30, 170, 46, 154, 30],
        [30, 170, 30, 154, 46, 170],
        [170, 170, 170, 154, 154, 170],
      ].map(([x1, y1, x2, y2, x3, y3], i) => (
        <polyline
          key={i}
          points={`${x2},${y2} ${x1},${y1} ${x3},${y3}`}
          stroke="currentColor"
          strokeWidth="2"
        />
      ))}
      {/* case edge with lugs */}
      <path
        d="M 60 90 A 40 40 0 0 1 140 90"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M 60 90 L 52 118 L 72 118 L 78 96" stroke="currentColor" strokeWidth="2" />
      <path d="M 140 90 L 148 118 L 128 118 L 122 96" stroke="currentColor" strokeWidth="2" />
      {/* engraved serial characters between the lugs */}
      {[80, 90, 100, 110, 120].map((x) => (
        <line key={x} x1={x} y1="104" x2={x} y2="112" stroke="currentColor" strokeWidth="2" opacity="0.8" />
      ))}
    </svg>
  );
}

function ClaspExample({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className}>
      {/* bracelet links, drawn as interlocking ellipses */}
      {[36, 60, 84].map((cx) => (
        <ellipse
          key={cx}
          cx={cx}
          cy="100"
          rx="14"
          ry="20"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.7"
        />
      ))}
      {/* folding clasp, hinged open */}
      <path
        d="M 100 76 L 150 76 L 150 100 L 100 100 Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M 100 100 L 150 100 L 150 128 L 100 118 Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="100" cy="100" r="2.5" fill="currentColor" />
      {/* engraving inside the open clasp */}
      <line x1="110" y1="86" x2="140" y2="86" stroke="currentColor" strokeWidth="1.5" />
      <line x1="110" y1="94" x2="132" y2="94" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function SideProfileExample({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className}>
      <rect x="40" y="86" width="120" height="28" rx="14" stroke="currentColor" strokeWidth="2" />
      <rect x="164" y="93" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="150" y="78" width="10" height="8" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
      <rect x="150" y="114" width="10" height="8" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
      <line x1="46" y1="86" x2="30" y2="76" stroke="currentColor" strokeWidth="2" />
      <line x1="46" y1="114" x2="30" y2="124" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function MovementExample({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className}>
      <circle cx="100" cy="100" r="78" stroke="currentColor" strokeWidth="2" />
      <circle cx="100" cy="100" r="66" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <path
        d="M 100 62 A 38 38 0 1 1 66 118"
        stroke="currentColor"
        strokeWidth="10"
        opacity="0.5"
      />
      <circle cx="118" cy="76" r="9" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="80" cy="122" r="7" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="128" cy="118" r="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="2.5" fill="currentColor" />
    </svg>
  );
}

function BoxPapersExample({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className}>
      <path
        d="M 30 90 L 100 70 L 170 90 L 100 110 Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M 30 90 L 30 130 L 100 150 L 100 110" stroke="currentColor" strokeWidth="2" />
      <path d="M 170 90 L 170 130 L 100 150" stroke="currentColor" strokeWidth="2" />
      <rect x="112" y="118" width="26" height="34" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
      <line x1="117" y1="126" x2="133" y2="126" stroke="currentColor" strokeWidth="1" opacity="0.8" />
      <line x1="117" y1="133" x2="133" y2="133" stroke="currentColor" strokeWidth="1" opacity="0.8" />
      <line x1="117" y1="140" x2="129" y2="140" stroke="currentColor" strokeWidth="1" opacity="0.8" />
      <circle cx="150" cy="60" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
      <circle cx="150" cy="56" r="2" stroke="currentColor" strokeWidth="1.2" opacity="0.8" />
    </svg>
  );
}

function OnWristExample({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className}>
      <path
        d="M 20 150 Q 100 190 180 130"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M 30 118 Q 100 156 172 100"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect
        x="82"
        y="88"
        width="36"
        height="36"
        rx="4"
        transform="rotate(-18 100 106)"
        stroke="currentColor"
        strokeWidth="2"
        fill="var(--paper)"
      />
      <circle cx="100" cy="106" r="3" fill="currentColor" transform="rotate(-18 100 106)" />
    </svg>
  );
}

const EXAMPLES: Record<ShotType, (props: { className?: string }) => React.JSX.Element> = {
  dial: DialExample,
  caseback: CasebackExample,
  serial_macro: SerialMacroExample,
  clasp: ClaspExample,
  side_profile: SideProfileExample,
  movement: MovementExample,
  box_papers: BoxPapersExample,
  on_wrist: OnWristExample,
};

export function ShotExampleIllustration({
  type,
  className,
}: {
  type: ShotType;
  className?: string;
}) {
  const Example = EXAMPLES[type];
  return <Example className={className} />;
}
