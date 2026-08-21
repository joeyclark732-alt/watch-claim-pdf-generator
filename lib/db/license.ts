import { getDB } from "./client";
import { LICENSE_KEY } from "./schema";

/**
 * Only the raw key string is stored — tier/validity is always re-derived by
 * re-verifying it, never cached, so there's no separate "trusted" state that
 * could drift from what the key actually says. Setting a new key is a plain
 * overwrite: matches spec's "accept a superseding key from day one" for
 * upgrades, since there's nothing to merge.
 */
export async function getStoredLicenseKey(): Promise<string | null> {
  const db = await getDB();
  const record = await db.get("license", LICENSE_KEY);
  return record?.raw ?? null;
}

export async function setStoredLicenseKey(raw: string): Promise<void> {
  const db = await getDB();
  await db.put("license", { raw }, LICENSE_KEY);
}
