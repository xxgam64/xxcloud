/**
 * End-to-End Encryption Service (E2EE)
 * Built with standard Web Crypto API (AES-256-GCM + PBKDF2-HMAC-SHA256)
 * Zero-Knowledge Architecture: Encryption/decryption occurs exclusively in browser memory.
 */

import { EncryptionMetadata } from '../types/drive';

// ArrayBuffer to Base64
export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Base64 to Uint8Array
export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// SHA-256 Checksum
export async function computeSha256(data: ArrayBuffer | Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', data as unknown as BufferSource);
  const hashArray = Array.from(new Uint8Array(digest));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Derive AES-256-GCM Key from Passphrase and Salt
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export interface EncryptedPayload {
  ciphertextBase64: string;
  metadata: EncryptionMetadata;
}

/**
 * Encrypt a string or file binary using user's passphrase
 */
export async function encryptData(
  data: ArrayBuffer | string,
  passphrase: string,
  fileName: string,
  mimeType: string
): Promise<EncryptedPayload> {
  const enc = new TextEncoder();
  const rawBytes: Uint8Array = typeof data === 'string' ? enc.encode(data) : new Uint8Array(data);

  // Generate 16 bytes salt and 12 bytes IV
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Compute original file checksum
  const checksum = await computeSha256(rawBytes);

  // Derive encryption key
  const cryptoKey = await deriveKey(passphrase, salt);

  // Encrypt with AES-GCM
  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource,
    },
    cryptoKey,
    rawBytes as unknown as BufferSource
  );

  const metadata: EncryptionMetadata = {
    algorithm: 'AES-256-GCM',
    iv: bufferToBase64(iv),
    salt: bufferToBase64(salt),
    originalMimeType: mimeType || 'application/octet-stream',
    originalName: fileName,
    originalSize: rawBytes.byteLength,
    checksum,
    encryptedAt: new Date().toISOString(),
  };

  return {
    ciphertextBase64: bufferToBase64(ciphertextBuffer),
    metadata,
  };
}

/**
 * Decrypt ciphertext using user's passphrase and metadata
 */
export async function decryptData(
  ciphertextBase64: string,
  passphrase: string,
  metadata: EncryptionMetadata
): Promise<{ decryptedBytes: Uint8Array; textContent?: string }> {
  const ciphertextBytes = base64ToUint8Array(ciphertextBase64);
  const salt = base64ToUint8Array(metadata.salt);
  const iv = base64ToUint8Array(metadata.iv);

  const cryptoKey = await deriveKey(passphrase, salt);

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource,
      },
      cryptoKey,
      ciphertextBytes as BufferSource
    );

    const decryptedBytes = new Uint8Array(decryptedBuffer);

    // Verify integrity checksum
    const computedChecksum = await computeSha256(decryptedBytes);
    if (computedChecksum !== metadata.checksum) {
      throw new Error('Integrity check failed: Checksum mismatch. The file may have been tampered with or corrupted.');
    }

    let textContent: string | undefined;
    if (
      metadata.originalMimeType.startsWith('text/') ||
      metadata.originalMimeType.includes('json') ||
      metadata.originalMimeType.includes('csv')
    ) {
      textContent = new TextDecoder().decode(decryptedBytes);
    }

    return { decryptedBytes, textContent };
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('Integrity check failed')) {
      throw err;
    }
    throw new Error('Gagal mendekripsi: Kata sandi brankas salah atau data terkorupsi.');
  }
}

/**
 * Vault Passphrase Verification Helper
 * Creates a verification hash stored locally so we can confirm password correctness instantly
 */
export async function createVaultVerifier(passphrase: string): Promise<{ verifierHash: string; salt: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltBase64 = bufferToBase64(salt);
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const verifierHash = bufferToBase64(bits);
  return { verifierHash, salt: saltBase64 };
}

export async function verifyVaultPassphrase(
  passphrase: string,
  verifierHash: string,
  saltBase64: string
): Promise<boolean> {
  const salt = base64ToUint8Array(saltBase64);
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const computedHash = bufferToBase64(bits);
  return computedHash === verifierHash;
}
