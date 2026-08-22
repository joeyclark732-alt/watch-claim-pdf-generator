import { Seal } from "./Seal";

/** The seal-plus-name lockup — the one form the WatchClaim mark takes. Assemble it here, not per page. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 text-ink ${className ?? ""}`}>
      <Seal size={32} />
      <span className="font-serif text-xl">WatchClaim</span>
    </span>
  );
}
