import { getDB } from "./client";
import type { WatchRecord } from "./schema";

export type WatchInput = Omit<
  WatchRecord,
  "id" | "created_at" | "updated_at"
>;

export async function createWatch(input: WatchInput): Promise<WatchRecord> {
  const db = await getDB();
  const now = new Date().toISOString();
  const watch: WatchRecord = {
    ...input,
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
  };
  await db.put("watches", watch);
  return watch;
}

export async function getWatch(id: string): Promise<WatchRecord | undefined> {
  const db = await getDB();
  return db.get("watches", id);
}

export async function listWatches(): Promise<WatchRecord[]> {
  const db = await getDB();
  return db.getAll("watches");
}

export async function updateWatch(
  id: string,
  patch: Partial<WatchInput>,
): Promise<WatchRecord> {
  const db = await getDB();
  const existing = await db.get("watches", id);
  if (!existing) {
    throw new Error(`Watch ${id} not found`);
  }
  const updated: WatchRecord = {
    ...existing,
    ...patch,
    id: existing.id,
    created_at: existing.created_at,
    updated_at: new Date().toISOString(),
  };
  await db.put("watches", updated);
  return updated;
}

export async function deleteWatch(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("watches", id);
}
