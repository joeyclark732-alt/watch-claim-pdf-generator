import { openDB, type IDBPDatabase } from "idb";
import type { ClaimFileDB } from "./schema";

const DB_NAME = "claim-file";
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<ClaimFileDB>> | null = null;

/**
 * Singleton connection. Each `if (oldVersion < N)` block below applies one
 * version's delta; a user reopening the app after skipping several releases
 * runs every intervening block in this one versionchange transaction. If a
 * later block throws, the whole transaction aborts and the DB stays on its
 * prior version rather than being left half-migrated.
 */
export function getDB(): Promise<IDBPDatabase<ClaimFileDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ClaimFileDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore("profile");
          db.createObjectStore("watches", { keyPath: "id" });

          const documents = db.createObjectStore("documents", {
            keyPath: "id",
          });
          documents.createIndex("watch_id", "watch_id");

          const photos = db.createObjectStore("photos", { keyPath: "id" });
          photos.createIndex("watch_id", "watch_id");
        }
        if (oldVersion < 2) {
          db.createObjectStore("license");
        }
      },
    });
  }
  return dbPromise;
}
