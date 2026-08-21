import { processForDocument } from "@/lib/images/process";
import { getDB } from "./client";
import type { DocType, DocumentRecord } from "./schema";

export interface DocumentInput {
  doc_type: DocType;
  file: File;
  issued_date: string | null;
  issuer_name: string;
  notes: string;
}

export async function listDocumentsForWatch(
  watchId: string,
): Promise<DocumentRecord[]> {
  const db = await getDB();
  return db.getAllFromIndex("documents", "watch_id", watchId);
}

/** For collection-wide scoring: one full-table read, grouped by watch_id in JS. */
export async function listAllDocuments(): Promise<DocumentRecord[]> {
  const db = await getDB();
  return db.getAll("documents");
}

export async function createDocument(
  watchId: string,
  input: DocumentInput,
): Promise<DocumentRecord> {
  const { file, ...rest } = input;
  const blob = file.type.startsWith("image/")
    ? await processForDocument(file)
    : file;

  const document: DocumentRecord = {
    ...rest,
    id: crypto.randomUUID(),
    watch_id: watchId,
    blob,
    file_name: file.name,
    mime_type: blob.type,
  };

  const db = await getDB();
  await db.put("documents", document);
  return document;
}

export async function deleteDocument(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("documents", id);
}
