export function Seal({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" aria-hidden="true">
      <circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="26" cy="26" r="18" fill="none" stroke="var(--rule)" strokeWidth="1" />
      <line x1="26" y1="2" x2="26" y2="9" stroke="currentColor" strokeWidth="1.5" />
      <line x1="50" y1="26" x2="43" y2="26" stroke="currentColor" strokeWidth="1.5" />
      <line x1="26" y1="50" x2="26" y2="43" stroke="currentColor" strokeWidth="1.5" />
      <line x1="2" y1="26" x2="9" y2="26" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="26" cy="26" r="6" fill="var(--oxblood)" />
    </svg>
  );
}
