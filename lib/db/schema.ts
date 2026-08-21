import type { DBSchema } from "idb";

export type ValuationBasis = "receipt" | "appraisal" | "owner_estimate";
export type WatchStatus = "owned" | "sold" | "lost_stolen";

export interface WatchRecord {
  id: string;
  brand: string;
  model_name: string;
  reference_number: string;
  serial_number: string;
  case_material: string;
  case_diameter_mm: number | null;
  lug_width_mm: number | null;
  movement_type: string;
  complications: string[];
  strap_type: string;
  purchase_date: string | null;
  purchase_price: number | null;
  purchase_currency: string;
  purchase_source: string;
  declared_value: number | null;
  declared_value_date: string | null;
  valuation_basis: ValuationBasis | null;
  condition_notes: string;
  has_box: boolean | null;
  has_papers: boolean | null;
  has_extra_links: boolean | null;
  status: WatchStatus;
  created_at: string;
  updated_at: string;
}

export type DocType =
  | "receipt"
  | "warranty_card"
  | "appraisal"
  | "service_record"
  | "authentication"
  | "policy_document"
  | "other";

export interface DocumentRecord {
  id: string;
  watch_id: string;
  doc_type: DocType;
  blob: Blob;
  file_name: string;
  mime_type: string;
  issued_date: string | null;
  issuer_name: string;
  notes: string;
}

export type ShotType =
  | "dial"
  | "caseback"
  | "serial_macro"
  | "clasp"
  | "side_profile"
  | "movement"
  | "box_papers"
  | "on_wrist";

export interface PhotoRecord {
  id: string;
  watch_id: string;
  shot_type: ShotType;
  blob_full: Blob;
  blob_thumb: Blob;
  taken_at: string;
}

export interface ProfileRecord {
  full_legal_name: string;
  mailing_address: string;
  insurer_name: string;
  policy_number: string;
}

/** Fixed out-of-line key `profile` is stored under — it's a single record, not a keyed collection. */
export const PROFILE_KEY = "default";

export interface ClaimFileDB extends DBSchema {
  profile: {
    key: string;
    value: ProfileRecord;
  };
  watches: {
    key: string;
    value: WatchRecord;
  };
  documents: {
    key: string;
    value: DocumentRecord;
    indexes: { watch_id: string };
  };
  photos: {
    key: string;
    value: PhotoRecord;
    indexes: { watch_id: string };
  };
}
