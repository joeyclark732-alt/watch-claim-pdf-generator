import { LICENSE_PUBLIC_KEY_BASE64 } from "./publicKey";
import type { Tier } from "./tiers";

export interface LicensePayload {
  email: string;
  tier: Tier;
  purchase_id: string;
  issued_at: string;
}

export interface VerifiedLicense {
  payload: LicensePayload;
}

const VALID_TIERS: Tier[] = ["single", "collection", "unlimited"];

function base64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(b64);
  const bytes: Uint8Array<ArrayBuffer> = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function base64UrlToBytes(b64url: string): Uint8Array<ArrayBuffer> {
  const padded = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return base64ToBytes(padded + pad);
}

function isLicensePayload(value: unknown): value is LicensePayload {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.email === "string" &&
    typeof v.tier === "string" &&
    VALID_TIERS.includes(v.tier as Tier) &&
    typeof v.purchase_id === "string" &&
    typeof v.issued_at === "string"
  );
}

/**
 * Any failure — malformed key, bad signature, tampered payload, unsupported
 * browser crypto — returns null. One uniform "invalid license key" message
 * upstream, same pattern as the backup passphrase failure in 3c.
 */
export async function verifyLicenseKey(raw: string): Promise<VerifiedLicense | null> {
  try {
    const parts = raw.trim().split(".");
    if (parts.length !== 2) return null;
    const [payloadPart, sigPart] = parts;

    const payloadBytes = base64UrlToBytes(payloadPart);
    const signatureBytes = base64UrlToBytes(sigPart);

    const publicKey = await crypto.subtle.importKey(
      "raw",
      base64ToBytes(LICENSE_PUBLIC_KEY_BASE64),
      { name: "Ed25519" },
      false,
      ["verify"],
    );

    const valid = await crypto.subtle.verify(
      { name: "Ed25519" },
      publicKey,
      signatureBytes,
      payloadBytes,
    );
    if (!valid) return null;

    const payload: unknown = JSON.parse(new TextDecoder().decode(payloadBytes));
    if (!isLicensePayload(payload)) return null;

    return { payload };
  } catch {
    return null;
  }
}
