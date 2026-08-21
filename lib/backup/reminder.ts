const STORAGE_KEY = "claimfile:edits-since-backup";
export const BACKUP_REMINDER_THRESHOLD = 5;

/**
 * A UI nudge counter only — not user data, so localStorage is the right
 * place for it, not IndexedDB. Bumped from lib/db's mutating functions
 * (the single choke point every UI path already goes through) rather than
 * from individual components.
 */
export function bumpEditCount(): void {
  if (typeof window === "undefined") return;
  const current = getEditCount();
  window.localStorage.setItem(STORAGE_KEY, String(current + 1));
}

export function getEditCount(): number {
  if (typeof window === "undefined") return 0;
  return Number(window.localStorage.getItem(STORAGE_KEY) ?? 0);
}

export function resetEditCount(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
