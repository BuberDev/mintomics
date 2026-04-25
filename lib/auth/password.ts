import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SALT_BYTES = 16;
const KEY_BYTES = 64;
const SCRYPT_PARAMS = {
  N: 16384,
  r: 8,
  p: 1,
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validatePasswordStrength(password: string) {
  const trimmed = password.trim();

  if (trimmed.length < 12) {
    return "Use at least 12 characters.";
  }

  if (!/[A-Z]/.test(trimmed)) {
    return "Add at least one uppercase letter.";
  }

  if (!/[a-z]/.test(trimmed)) {
    return "Add at least one lowercase letter.";
  }

  if (!/[0-9]/.test(trimmed)) {
    return "Add at least one number.";
  }

  return null;
}

export function hashPassword(password: string) {
  const salt = randomBytes(SALT_BYTES);
  const derivedKey = scryptSync(password, salt, KEY_BYTES, SCRYPT_PARAMS);

  return [
    "scrypt",
    SCRYPT_PARAMS.N,
    SCRYPT_PARAMS.r,
    SCRYPT_PARAMS.p,
    salt.toString("base64url"),
    Buffer.from(derivedKey).toString("base64url"),
  ].join("$");
}

export function verifyPassword(password: string, storedHash: string) {
  const parts = storedHash.split("$");

  if (parts.length !== 6 || parts[0] !== "scrypt") {
    return false;
  }

  const [, nString, rString, pString, saltB64, hashB64] = parts;
  const n = Number(nString);
  const r = Number(rString);
  const p = Number(pString);

  if (!Number.isFinite(n) || !Number.isFinite(r) || !Number.isFinite(p)) {
    return false;
  }

  const salt = Buffer.from(saltB64, "base64url");
  const expected = Buffer.from(hashB64, "base64url");
  const actual = scryptSync(password, salt, expected.length, { N: n, r, p });

  if (actual.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
}
