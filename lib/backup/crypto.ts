const ITERATIONS = 600_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

export interface EncryptedBundle {
  format_version: 1;
  salt: string; // base64
  iv: string; // base64
  iterations: number;
  ciphertext: string; // base64
}

function toBase64(bytes: Uint8Array<ArrayBuffer>): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(b64);
  const bytes: Uint8Array<ArrayBuffer> = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveKey(
  passphrase: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number,
): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/** Fresh random salt and IV every call, per spec — never reused across exports. */
export async function encryptBundle(
  passphrase: string,
  plaintext: Uint8Array<ArrayBuffer>,
): Promise<EncryptedBundle> {
  const salt: Uint8Array<ArrayBuffer> = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv: Uint8Array<ArrayBuffer> = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveKey(passphrase, salt, ITERATIONS);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  return {
    format_version: 1,
    salt: toBase64(salt),
    iv: toBase64(iv),
    iterations: ITERATIONS,
    ciphertext: toBase64(new Uint8Array(ciphertext)),
  };
}

/**
 * AES-GCM is authenticated encryption: a wrong passphrase or a corrupted
 * file fails the auth-tag check and this throws directly — no separate
 * validation step needed to distinguish "bad passphrase" from "bad file."
 */
export async function decryptBundle(
  passphrase: string,
  bundle: EncryptedBundle,
): Promise<Uint8Array<ArrayBuffer>> {
  const salt = fromBase64(bundle.salt);
  const iv = fromBase64(bundle.iv);
  const key = await deriveKey(passphrase, salt, bundle.iterations);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    fromBase64(bundle.ciphertext),
  );
  return new Uint8Array(plaintext);
}

export function blobToBase64(blob: Blob): Promise<string> {
  return blob.arrayBuffer().then((buf) => toBase64(new Uint8Array(buf)));
}

export function base64ToBlob(b64: string, type: string): Blob {
  return new Blob([fromBase64(b64)], { type });
}
