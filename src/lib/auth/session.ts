import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { db } from '@/prisma/db';

export const SESSION_COOKIE_NAME = 'session_token';
export const SESSION_EXPIRY_DAYS = 7;

/**
 * Hashes a raw session token using SHA-256 for secure database storage.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generates a cryptographically secure 64-character hex session token.
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Sets the secure HTTP-only session cookie.
 */
export async function setSessionCookie(rawToken: string, expiresAt: Date): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

/**
 * Reads the current session token from HTTP cookies.
 */
export async function getSessionTokenCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

/**
 * Clears the HTTP-only session cookie.
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Creates a new database-backed session and sets the HTTP-only session cookie.
 */
export async function createSession(userId: string): Promise<{
  sessionId: string;
  rawToken: string;
  expiresAt: Date;
}> {
  const rawToken = generateSessionToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const session = await db.orm.public.Session.create({
    userId: userId as any,
    tokenHash,
    expiresAt: expiresAt.toISOString(),
  });

  await setSessionCookie(rawToken, expiresAt);

  return {
    sessionId: session.id,
    rawToken,
    expiresAt,
  };
}

/**
 * Validates a session by raw token. Checks expiration and revocation.
 */
export async function validateSessionToken(rawToken: string): Promise<{
  session: {
    id: string;
    userId: string;
    expiresAt: string;
    revokedAt: string | null;
  };
  user: {
    id: string;
    email: string;
    username: string | null;
    name: string | null;
  };
} | null> {
  if (!rawToken || rawToken.trim() === '') {
    return null;
  }

  const tokenHash = hashToken(rawToken);

  const sessionRecord = await db.orm.public.Session
    .where({ tokenHash })
    .include('user', (u) =>
      u.select('id', 'email', 'username', 'name')
    )
    .first();

  if (!sessionRecord || !sessionRecord.user) {
    return null;
  }

  // Check if session has been revoked
  if (sessionRecord.revokedAt) {
    return null;
  }

  // Check if session has expired
  const expiresAtMs = new Date(sessionRecord.expiresAt).getTime();
  if (Date.now() >= expiresAtMs) {
    return null;
  }

  return {
    session: {
      id: sessionRecord.id,
      userId: sessionRecord.userId,
      expiresAt: sessionRecord.expiresAt,
      revokedAt: sessionRecord.revokedAt ?? null,
    },
    user: {
      id: sessionRecord.user.id,
      email: sessionRecord.user.email,
      username: sessionRecord.user.username ?? null,
      name: sessionRecord.user.name ?? null,
    },
  };
}

/**
 * Gets and validates the current active session based on the session cookie.
 */
export async function getCurrentSession() {
  const token = await getSessionTokenCookie();
  if (!token) {
    return null;
  }
  return await validateSessionToken(token);
}

/**
 * Revokes a single session by raw token (or current cookie token) and clears the cookie.
 */
export async function revokeSession(rawToken?: string): Promise<void> {
  const tokenToRevoke = rawToken ?? (await getSessionTokenCookie());

  if (tokenToRevoke) {
    const tokenHash = hashToken(tokenToRevoke);
    const existing = await db.orm.public.Session.where({ tokenHash }).first();
    if (existing && !existing.revokedAt) {
      await db.orm.public.Session.where({ id: existing.id }).update({
        revokedAt: new Date().toISOString(),
      });
    }
  }

  await clearSessionCookie();
}

/**
 * Revokes ALL active sessions for a user (e.g. after password reset).
 */
export async function revokeAllUserSessions(userId: string): Promise<void> {
  const activeSessions = await db.orm.public.Session
    .where({ userId: userId as any })
    .all();

  const nowIso = new Date().toISOString();

  for (const s of activeSessions) {
    if (!s.revokedAt) {
      await db.orm.public.Session.where({ id: s.id }).update({
        revokedAt: nowIso,
      });
    }
  }

  await clearSessionCookie();
}
