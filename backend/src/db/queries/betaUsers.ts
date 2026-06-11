import { pool } from '../pool';
import { v4 as uuidv4 } from 'uuid';

export interface BetaUser {
  betaUserId: string;
  userId: string;
  inviteCode: string;
  status: 'pending' | 'active' | 'inactive';
  joinedAt: Date;
  tier: 'early-access' | 'power-user' | 'agency';
  feedbackScore: number;
  videosProcessed: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BetaInvite {
  inviteId: string;
  inviteCode: string;
  email: string;
  tier: 'early-access' | 'power-user' | 'agency';
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: Date;
  createdAt: Date;
  createdBy: string;
}

/**
 * Create a new beta user
 */
export async function createBetaUser(
  userId: string,
  tier: 'early-access' | 'power-user' | 'agency'
): Promise<BetaUser> {
  const betaUserId = uuidv4();
  const inviteCode = generateInviteCode();

  const result = await pool.query(
    `INSERT INTO beta_users (beta_user_id, user_id, invite_code, status, tier)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [betaUserId, userId, inviteCode, 'active', tier]
  );

  return result.rows[0];
}

/**
 * Get beta user by user ID
 */
export async function getBetaUserByUserId(userId: string): Promise<BetaUser | null> {
  const result = await pool.query(
    'SELECT * FROM beta_users WHERE user_id = $1',
    [userId]
  );

  return result.rows[0] || null;
}

/**
 * Get beta user by invite code
 */
export async function getBetaUserByInviteCode(
  inviteCode: string
): Promise<BetaUser | null> {
  const result = await pool.query(
    'SELECT * FROM beta_users WHERE invite_code = $1',
    [inviteCode]
  );

  return result.rows[0] || null;
}

/**
 * Update beta user status
 */
export async function updateBetaUserStatus(
  userId: string,
  status: 'pending' | 'active' | 'inactive'
): Promise<BetaUser> {
  const result = await pool.query(
    `UPDATE beta_users 
     SET status = $1, updated_at = NOW()
     WHERE user_id = $2
     RETURNING *`,
    [status, userId]
  );

  return result.rows[0];
}

/**
 * Increment videos processed count
 */
export async function incrementVideosProcessed(userId: string): Promise<void> {
  await pool.query(
    `UPDATE beta_users 
     SET videos_processed = videos_processed + 1
     WHERE user_id = $1`,
    [userId]
  );
}

/**
 * Update feedback score
 */
export async function updateFeedbackScore(
  userId: string,
  score: number
): Promise<void> {
  await pool.query(
    `UPDATE beta_users 
     SET feedback_score = (feedback_score + $1) / 2
     WHERE user_id = $2`,
    [score, userId]
  );
}

/**
 * Create beta invite
 */
export async function createBetaInvite(
  email: string,
  tier: 'early-access' | 'power-user' | 'agency',
  createdBy: string,
  expiresInDays: number = 30
): Promise<BetaInvite> {
  const inviteId = uuidv4();
  const inviteCode = generateInviteCode();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const result = await pool.query(
    `INSERT INTO beta_invites (invite_id, invite_code, email, tier, created_by, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [inviteId, inviteCode, email, tier, createdBy, expiresAt]
  );

  return result.rows[0];
}

/**
 * Get pending invites
 */
export async function getPendingInvites(): Promise<BetaInvite[]> {
  const result = await pool.query(
    `SELECT * FROM beta_invites 
     WHERE status = 'pending' AND expires_at > NOW()
     ORDER BY created_at DESC`
  );

  return result.rows;
}

/**
 * Accept beta invite
 */
export async function acceptBetaInvite(
  inviteCode: string,
  userId: string
): Promise<BetaInvite> {
  const result = await pool.query(
    `UPDATE beta_invites 
     SET status = 'accepted', user_id = $1
     WHERE invite_code = $2 AND status = 'pending' AND expires_at > NOW()
     RETURNING *`,
    [userId, inviteCode]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid or expired invite code');
  }

  return result.rows[0];
}

/**
 * Get beta statistics
 */
export async function getBetaStatistics(): Promise<{
  totalBetaUsers: number;
  activeBetaUsers: number;
  totalVideosProcessed: number;
  averageFeedbackScore: number;
  pendingInvites: number;
}> {
  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM beta_users) as total_beta_users,
      (SELECT COUNT(*) FROM beta_users WHERE status = 'active') as active_beta_users,
      (SELECT SUM(videos_processed) FROM beta_users) as total_videos_processed,
      (SELECT AVG(feedback_score) FROM beta_users WHERE feedback_score > 0) as avg_feedback_score,
      (SELECT COUNT(*) FROM beta_invites WHERE status = 'pending' AND expires_at > NOW()) as pending_invites
  `);

  const stats = result.rows[0];

  return {
    totalBetaUsers: parseInt(stats.total_beta_users),
    activeBetaUsers: parseInt(stats.active_beta_users),
    totalVideosProcessed: parseInt(stats.total_videos_processed) || 0,
    averageFeedbackScore: parseFloat(stats.avg_feedback_score) || 0,
    pendingInvites: parseInt(stats.pending_invites),
  };
}

/**
 * Generate a unique invite code
 */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
