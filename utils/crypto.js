// utils/crypto.js
import { ethers } from "ethers";

let cachedKey = null;

// Derive AES-GCM key from wallet signature (only once per session)
export async function getWalletKey(signer) {
  if (cachedKey) return cachedKey;

  const msg = "BlockDrive-Encryption-Key";
  const sig = await signer.signMessage(msg);

  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(sig)
  );

  cachedKey = await crypto.subtle.importKey("raw", hashBuffer, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);

  return cachedKey;
}

// Encrypt (reuse cached key)
export async function encryptFileWithWalletKey(file, signer) {
  const key = await getWalletKey(signer);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const fileBuffer = await file.arrayBuffer();

  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, fileBuffer);

  const encBytes = new Uint8Array(encrypted);

  // --- embed MIME type ---
  const mimeBytes = new TextEncoder().encode(file.type || "application/octet-stream");
  const mimeLength = new Uint8Array([mimeBytes.length]);

  const out = new Uint8Array(1 + mimeBytes.length + iv.length + encBytes.length);
  out.set(mimeLength, 0);
  out.set(mimeBytes, 1);
  out.set(iv, 1 + mimeBytes.length);
  out.set(encBytes, 1 + mimeBytes.length + iv.length);

  return { blob: new Blob([out], { type: "application/octet-stream" }) };
}

// Decrypt (reuse cached key)
export async function decryptWithWalletKey(encryptedBuffer, signer) {
  const key = await getWalletKey(signer);
  const data = new Uint8Array(encryptedBuffer);

  const mimeLength = data[0];
  const mimeBytes = data.slice(1, 1 + mimeLength);
  const mimeType = new TextDecoder().decode(mimeBytes);

  const ivStart = 1 + mimeLength;
  const iv = data.slice(ivStart, ivStart + 12);
  const encBytes = data.slice(ivStart + 12);

  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encBytes);

  return new Blob([decrypted], { type: mimeType });
}
