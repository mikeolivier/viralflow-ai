import { query } from '../pool.js';
import { v4 as uuidv4 } from 'uuid';

export interface Session {
  id: string;
  user_id: string;
  refresh_token: string;
  expires_at: Date;
  created_at: Date;
}

/**
 * Create a new session
 */
export async function createSession(
  userId: string,
  refreshToken: string,
  expiresAt: Date
): Promise<Session> {
  const id = uuidv4();
  const result = await query(
    `INSERT INTO sessions (id, user_id, refresh_token, expires_at, created_at)
     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
     RETURNING id, user_id, refresh_token, expires_at, created_at`,
    [id, userId, refreshToken, expiresAt]
  );

  return result.rows[0];
}

/**
 * Get session by refresh token
 */
export async function getSessionByRefreshToken(refreshToken: string): Promise<Session | null> {
  const result = await query(
    `SELECT id, user_id, refresh_token, expires_at, created_at
     FROM sessions
     WHERE refresh_token = $1 AND expires_at > CURRENT_TIMESTAMP`,
    [refreshToken]
  );

  return result.rows[0] || null;
}

/**
 * Get sessions by user ID
 */
export async function getSessionsByUserId(userId: string): Promise<Session[]> {
  const result = await query(
    `SELECT id, user_id, refresh_token, expires_at, created_at
     FROM sessions
     WHERE user_id = $1 AND expires_at > CURRENT_TIMESTAMP
     ORDER BY created_at DESC`,
    [userId]
  );

  return result.rows;
}

/**
 * Delete session by ID
 */
export async function deleteSession(sessionId: string): Promise<boolean> {
  const result = await query(
    `DELETE FROM sessions WHERE id = $1`,
    [sessionId]
  );

  return result.rowCount! > 0;
}

/**
 * Delete session by refresh token
 */
export async function deleteSessionByRefreshToken(refreshToken: string): Promise<boolean> {
  const result = await query(
    `DELETE FROM sessions WHERE refresh_token = $1`,
    [refreshToken]
  );

  return result.rowCount! > 0;
}

/**
 * Delete all sessions for a user
 */
export async function deleteAllUserSessions(userId: string): Promise<number> {
  const result = await query(
    `DELETE FROM sessions WHERE user_id = $1`,
    [userId]
  );

  return result.rowCount!;
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await query(
    `DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP`
  );

  return result.rowCount!;
}
