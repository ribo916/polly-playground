import crypto from "crypto";

// Get encryption key: 32 bytes for AES-256
// In production, set COOKIE_ENCRYPTION_SECRET to a 32-byte hex string or base64
const getEncryptionKey = (): Buffer => {
  if (process.env.COOKIE_ENCRYPTION_SECRET) {
    // If provided as hex string
    if (process.env.COOKIE_ENCRYPTION_SECRET.length === 64) {
      return Buffer.from(process.env.COOKIE_ENCRYPTION_SECRET, "hex");
    }
    // If provided as base64, decode it
    try {
      const decoded = Buffer.from(process.env.COOKIE_ENCRYPTION_SECRET, "base64");
      if (decoded.length >= 32) {
        return decoded.slice(0, 32);
      }
    } catch {}
    // If provided as plain string, hash it
    return crypto.createHash("sha256").update(process.env.COOKIE_ENCRYPTION_SECRET).digest();
  }
  // Fallback: stable secret derived from a constant (dev only)
  return crypto.createHash("sha256").update("polly-playground-default-secret").digest();
};

const COOKIE_SECRET = getEncryptionKey();

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypts data for storage in a cookie
 */
export function encryptCookieValue(data: Record<string, string>): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, COOKIE_SECRET, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(data), "utf8"),
    cipher.final(),
  ]);
  
  const authTag = cipher.getAuthTag();
  
  // Combine: iv + authTag + encrypted data, all base64 encoded
  const combined = Buffer.concat([iv, authTag, encrypted]);
  return combined.toString("base64url");
}

/**
 * Decrypts data from a cookie
 */
export function decryptCookieValue(encrypted: string): Record<string, string> | null {
  try {
    const combined = Buffer.from(encrypted, "base64url");
    
    if (combined.length < IV_LENGTH + AUTH_TAG_LENGTH) {
      return null;
    }
    
    const iv = combined.slice(0, IV_LENGTH);
    const authTag = combined.slice(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encryptedData = combined.slice(IV_LENGTH + AUTH_TAG_LENGTH);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, COOKIE_SECRET, iv);
    decipher.setAuthTag(authTag);
    
    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);
    
    return JSON.parse(decrypted.toString("utf8"));
  } catch {
    return null;
  }
}

