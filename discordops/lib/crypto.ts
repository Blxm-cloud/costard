"use client";

// Client-only encryption for the bot token. The passphrase is generated
// per browser tab and lives only in memory (module-level variable) — it is
// never written to storage and never sent to the server. This means the
// encrypted token in sessionStorage is useless without the in-memory key,
// which disappears on full page reload by design (defense in depth: even
// if an attacker reads sessionStorage via XSS, they still need the live
// JS heap to decrypt it).

import CryptoJS from "crypto-js";

let sessionPassphrase: string | null = null;

function getPassphrase(): string {
  if (!sessionPassphrase) {
    sessionPassphrase = CryptoJS.lib.WordArray.random(32).toString();
  }
  return sessionPassphrase;
}

export function encryptToken(token: string): string {
  return CryptoJS.AES.encrypt(token, getPassphrase()).toString();
}

export function decryptToken(cipherText: string): string | null {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, getPassphrase());
    const plain = bytes.toString(CryptoJS.enc.Utf8);
    return plain || null;
  } catch {
    return null;
  }
}

const STORAGE_KEY = "discordops_bot_token_enc";

export function persistEncryptedToken(token: string) {
  sessionStorage.setItem(STORAGE_KEY, encryptToken(token));
}

export function readPersistedToken(): string | null {
  const cipher = sessionStorage.getItem(STORAGE_KEY);
  if (!cipher) return null;
  // Will only succeed within the same tab session (same in-memory passphrase).
  return decryptToken(cipher);
}

export function clearPersistedToken() {
  sessionStorage.removeItem(STORAGE_KEY);
  sessionPassphrase = null;
}
