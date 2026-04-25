import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function generateId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function generateSecureToken(byteLength = 32) {
  return randomBytes(byteLength).toString("base64url");
}

export function sha256Base64url(value: string) {
  return createHash("sha256").update(value, "utf8").digest("base64url");
}

export function constantTimeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
