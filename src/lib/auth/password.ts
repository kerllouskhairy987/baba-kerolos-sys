import argon2 from 'argon2';

/**
 * Server-only password utility using Argon2id.
 */

/**
 * Hashes a plaintext password using Argon2id with secure memory and time parameters.
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || typeof password !== 'string') {
    throw new Error('Invalid password provided for hashing.');
  }

  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3, // 3 iterations
    parallelism: 1,
  });
}

/**
 * Verifies a plaintext password against an Argon2id hash in constant time.
 */
export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  if (!password || !passwordHash) {
    return false;
  }

  try {
    return await argon2.verify(passwordHash, password);
  } catch (error) {
    // Return false on verification error without leaking exception details
    return false;
  }
}
