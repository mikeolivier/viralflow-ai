import { query, transaction, getClient } from '../pool.js';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  username?: string;
  password_hash: string;
  subscription_tier: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  email: string;
  username?: string;
  password_hash: string;
}

export interface UpdateUserInput {
  username?: string;
  subscription_tier?: string;
}

/**
 * Create a new user
 */
export async function createUser(input: CreateUserInput): Promise<User> {
  const id = uuidv4();
  const result = await query(
    `INSERT INTO users (id, email, username, password_hash, subscription_tier, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     RETURNING id, email, username, password_hash, subscription_tier, created_at, updated_at`,
    [id, input.email, input.username || null, input.password_hash, 'free']
  );

  return result.rows[0];
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const result = await query(
    `SELECT id, email, username, password_hash, subscription_tier, created_at, updated_at
     FROM users
     WHERE id = $1 AND deleted_at IS NULL`,
    [userId]
  );

  return result.rows[0] || null;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query(
    `SELECT id, email, username, password_hash, subscription_tier, created_at, updated_at
     FROM users
     WHERE email = $1 AND deleted_at IS NULL`,
    [email]
  );

  return result.rows[0] || null;
}

/**
 * Get user by username
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  const result = await query(
    `SELECT id, email, username, password_hash, subscription_tier, created_at, updated_at
     FROM users
     WHERE username = $1 AND deleted_at IS NULL`,
    [username]
  );

  return result.rows[0] || null;
}

/**
 * Update user
 */
export async function updateUser(userId: string, input: UpdateUserInput): Promise<User | null> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (input.username !== undefined) {
    updates.push(`username = $${paramCount}`);
    values.push(input.username);
    paramCount++;
  }

  if (input.subscription_tier !== undefined) {
    updates.push(`subscription_tier = $${paramCount}`);
    values.push(input.subscription_tier);
    paramCount++;
  }

  if (updates.length === 0) {
    return getUserById(userId);
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(userId);

  const result = await query(
    `UPDATE users
     SET ${updates.join(', ')}
     WHERE id = $${paramCount} AND deleted_at IS NULL
     RETURNING id, email, username, password_hash, subscription_tier, created_at, updated_at`,
    values
  );

  return result.rows[0] || null;
}

/**
 * Delete user (soft delete)
 */
export async function deleteUser(userId: string): Promise<boolean> {
  const result = await query(
    `UPDATE users
     SET deleted_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND deleted_at IS NULL`,
    [userId]
  );

  return result.rowCount! > 0;
}

/**
 * Check if email exists
 */
export async function emailExists(email: string): Promise<boolean> {
  const result = await query(
    `SELECT 1 FROM users WHERE email = $1 AND deleted_at IS NULL`,
    [email]
  );

  return result.rows.length > 0;
}

/**
 * Check if username exists
 */
export async function usernameExists(username: string): Promise<boolean> {
  const result = await query(
    `SELECT 1 FROM users WHERE username = $1 AND deleted_at IS NULL`,
    [username]
  );

  return result.rows.length > 0;
}

/**
 * Get user count
 */
export async function getUserCount(): Promise<number> {
  const result = await query(
    `SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL`
  );

  return parseInt(result.rows[0].count, 10);
}

/**
 * Get users by subscription tier
 */
export async function getUsersBySubscriptionTier(tier: string): Promise<User[]> {
  const result = await query(
    `SELECT id, email, username, password_hash, subscription_tier, created_at, updated_at
     FROM users
     WHERE subscription_tier = $1 AND deleted_at IS NULL
     ORDER BY created_at DESC`,
    [tier]
  );

  return result.rows;
}
