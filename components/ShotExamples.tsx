import type { ShotType } from "@/lib/db";
import { WatchIcon } from "./WatchIcon";

/**
 * Original line-art diagrams, one per checklist shot — same reasoning as
 * WatchIcon: no photography, no licensing surface, and it keeps every
 * illustration in the app rendering identically regardless of device or
 * network. Each is a schematic of framing/angle, not a literal photo.
 *
 * Every non-obvious diagram carries a one- or two-word caption pointing at
 * the part it's depicting — the abstraction that makes a sketch legible at
 * 160px is exactly what makes it ambiguous without a label.
 */

function Caption({ text, y = 178 }: { text: string; y?: number }) {
  return (
    <text
      x="100"
      y={y}
      textAnchor="middle"
      fontSize="15"
      fill="currentColor"
      className="font-sans"
      opacity="0.75"
    >
      {text}
    </text>
  );
}

function DialExample({ className }: { className?: string }) {
  return <WatchIcon className={className} />;
}

function CasebackExample({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className}>
      <circle cx="100" cy="92" r="62" stroke="currentColor" strokeWidth="2" />
      <circle cx="100" cy="92" r="48" stroke="currentColor" strokeWidth="1.5" />
      <rect x="72" y="82" width="56" height="22" stroke="currentColor" strokeWidth="2" />
      <line x1="79" y1="89" x2="121" y2="89" stroke="currentColor" strokeWidth="1.5" />
      <line x1="79" y1="97" x2="109" y2="97" stroke="currentColor" strokeWidth="1.5" />
      <Caption text="engraved plate" />
    </svg>
  );
}

function SerialMacroExample({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className}>
      {/* engraved characters, the actual subject */}
      <rect x="58" y="80" width="84" height="26" stroke="currentColor" strokeWidth="2" />
      {[70, 84, 98, 112, 126].map((x) => (
        <line key={x} x1={x} y1="88" x2={x} y2="98" stroke="currentColor" strokeWidth="2.5" />
      ))}
      {/* magnifying glass over it, signals macro/close-up */}
      <circle cx="128" cy="70" r="26" stroke="currentColor" strokeWidth="2.5" fill="var(--paper)" />
      <line x1="146" y1="88" x2="164" y2="106" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <Caption text="serial number, close up" />
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
          cy="92"
          rx="14"
          ry="20"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.7"
        />
      ))}
      {/* folding clasp, hinged open */}
      <path d="M 100 68 L 150 68 L 150 92 L 100 92 Z" stroke="currentColor" strokeWidth="2" />
      <path d="M 100 92 L 150 92 L 150 120 L 100 110 Z" stroke="currentColor" strokeWidth="2" />
      <circle cx="100" cy="92" r="2.5" fill="currentColor" />
      {/* engraving inside the open clasp */}
      <line x1="110" y1="78" x2="140" y2="78" stroke="currentColor" strokeWidth="1.5" />
      <line x1="110" y1="86" x2="132" y2="86" stroke="currentColor" strokeWidth="1.5" />
      <Caption text="clasp, opened" />
    </svg>
  );
}

function SideProfileExample({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className}>
      {/* strap ends */}
      <path d="M 44 78 L 24 68 L 24 60" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M 44 106 L 24 116 L 24 124" stroke="currentColor" strokeWidth="2" fill="none" />
      {/* case, viewed edge-on */}
      <rect x="44" y="78" width="112" height="28" rx="13" stroke="currentColor" strokeWidth="2.5" />
      {/* crown */}
      <rect x="158" y="85" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="2.5" />
      {/* pushers */}
      <rect x="144" y="70" width="10" height="9" stroke="currentColor" strokeWidth="2" />
      <rect x="144" y="107" width="10" height="9" stroke="currentColor" strokeWidth="2" />
      <Caption text="crown & pushers" />
    </svg>
  );
}

function MovementExample({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className}>
      <circle cx="100" cy="92" r="62" stroke="currentColor" strokeWidth="2" />
      <circle cx="100" cy="92" r="50" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <path d="M 100 54 A 38 38 0 1 1 66 110" stroke="currentColor" strokeWidth="9" opacity="0.6" />
      <circle cx="118" cy="68" r="8" stroke="currentColor" strokeWidth="2" />
      <circle cx="80" cy="114" r="6" stroke="currentColor" strokeWidth="2" />
      <circle cx="126" cy="110" r="4.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="100" cy="92" r="2.5" fill="currentColor" />
      <Caption text="gear train visible" />
    </svg>
  );
}

function BoxPapersExample({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className}>
      <path d="M 28 76 L 100 56 L 172 76 L 100 96 Z" stroke="currentColor" strokeWidth="2" />
      <path d="M 28 76 L 28 116 L 100 136 L 100 96" stroke="currentColor" strokeWidth="2" />
      <path d="M 172 76 L 172 116 L 100 136" stroke="currentColor" strokeWidth="2" />
      <rect x="112" y="102" width="26" height="34" stroke="currentColor" strokeWidth="2" />
      <line x1="117" y1="110" x2="133" y2="110" stroke="currentColor" strokeWidth="1.5" />
      <line x1="117" y1="117" x2="133" y2="117" stroke="currentColor" strokeWidth="1.5" />
      <line x1="117" y1="124" x2="129" y2="124" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="152" cy="48" r="9" stroke="currentColor" strokeWidth="2" />
      <circle cx="152" cy="43" r="2" stroke="currentColor" strokeWidth="1.5" />
      <Caption text="box, papers, tag" />
    </svg>
  );
}

function OnWristExample({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className}>
      {/* forearm, viewed from above looking down at the wrist */}
      <path
        d="M 30 72 C 30 56, 60 46, 100 46 C 148 46, 178 60, 178 82 L 178 100 C 178 118, 148 128, 100 128 C 60 128, 30 118, 30 102 Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* strap crossing the wrist */}
      <path d="M 84 46 L 78 128" stroke="currentColor" strokeWidth="2" />
      <path d="M 116 46 L 122 128" stroke="currentColor" strokeWidth="2" />
      {/* watch head sitting on top */}
      <circle cx="100" cy="87" r="30" stroke="currentColor" strokeWidth="2.5" fill="var(--paper)" />
      <circle cx="100" cy="87" r="21" stroke="currentColor" strokeWidth="1.5" />
      <Caption text="worn, full wrist in frame" />
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
