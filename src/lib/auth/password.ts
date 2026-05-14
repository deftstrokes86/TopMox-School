import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SCRYPT_PREFIX = "scrypt";
const SCRYPT_KEY_LENGTH = 64;

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hashed = scryptSync(plainPassword, salt, SCRYPT_KEY_LENGTH).toString("hex");
  return `${SCRYPT_PREFIX}$${salt}$${hashed}`;
}

export async function verifyPassword(
  plainPassword: string,
  storedPasswordHash: string
): Promise<boolean> {
  // Backward compatibility for seeded demo users from prior phases.
  if (!storedPasswordHash.startsWith(`${SCRYPT_PREFIX}$`)) {
    return safeEqual(plainPassword, storedPasswordHash);
  }

  const parts = storedPasswordHash.split("$");
  if (parts.length !== 3) {
    return false;
  }

  const [, salt, expectedHash] = parts;
  const attemptedHash = scryptSync(plainPassword, salt, SCRYPT_KEY_LENGTH).toString(
    "hex"
  );

  return safeEqual(attemptedHash, expectedHash);
}
