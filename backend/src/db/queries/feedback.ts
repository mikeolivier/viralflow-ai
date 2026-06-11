import { pool } from '../pool';
import { v4 as uuidv4 } from 'uuid';

export interface UserFeedback {
  feedbackId: string;
  userId: string;
  videoId?: string;
  type: 'bug' | 'feature-request' | 'general' | 'video-quality';
  rating: number; // 1-5
  title: string;
  message: string;
  metadata?: Record<string, any>;
  status: 'new' | 'reviewed' | 'in-progress' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create feedback entry
 */
export async function createFeedback(
  userId: string,
  type: 'bug' | 'feature-request' | 'general' | 'video-quality',
  rating: number,
  title: string,
  message: string,
  videoId?: string,
  metadata?: Record<string, any>
): Promise<UserFeedback> {
  const feedbackId = uuidv4();

  const result = await pool.query(
    `INSERT INTO user_feedback (feedback_id, user_id, video_id, type, rating, title, message, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [feedbackId, userId, videoId || null, type, rating, title, message, metadata || null]
  );

  return result.rows[0];
}

/**
 * Get feedback by ID
 */
export async function getFeedbackById(feedbackId: string): Promise<UserFeedback | null> {
  const result = await pool.query(
    'SELECT * FROM user_feedback WHERE feedback_id = $1',
    [feedbackId]
  );

  return result.rows[0] || null;
}

/**
 * Get all feedback with pagination
 */
export async function getAllFeedback(
  page: number = 1,
  limit: number = 20,
  type?: string,
  status?: string
): Promise<{ feedback: UserFeedback[]; total: number }> {
  let query = 'SELECT * FROM user_feedback WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (type) {
    query += ` AND type = $${paramIndex}`;
    params.push(type);
    paramIndex++;
  }

  if (status) {
    query += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  // Get total count
  const countResult = await pool.query(
    `SELECT COUNT(*) as total FROM user_feedback WHERE 1=1 ${
      type ? `AND type = $1` : ''
    } ${status ? `AND status = $${type ? 2 : 1}` : ''}`,
    params
  );
  const total = parseInt(countResult.rows[0].total);

  // Get paginated results
  query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, (page - 1) * limit);

  const result = await pool.query(query, params);

  return { feedback: result.rows, total };
}

/**
 * Get user feedback
 */
export async function getUserFeedback(
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ feedback: UserFeedback[]; total: number }> {
  const countResult = await pool.query(
    'SELECT COUNT(*) as total FROM user_feedback WHERE user_id = $1',
    [userId]
  );
  const total = parseInt(countResult.rows[0].total);

  const result = await pool.query(
    `SELECT * FROM user_feedback 
     WHERE user_id = $1 
     ORDER BY created_at DESC 
     LIMIT $2 OFFSET $3`,
    [userId, limit, (page - 1) * limit]
  );

  return { feedback: result.rows, total };
}

/**
 * Update feedback status
 */
export async function updateFeedbackStatus(
  feedbackId: string,
  status: 'new' | 'reviewed' | 'in-progress' | 'resolved'
): Promise<UserFeedback> {
  const result = await pool.query(
    `UPDATE user_feedback 
     SET status = $1, updated_at = NOW()
     WHERE feedback_id = $2
     RETURNING *`,
    [status, feedbackId]
  );

  return result.rows[0];
}

/**
 * Get feedback statistics
 */
export async function getFeedbackStatistics(): Promise<{
  totalFeedback: number;
  averageRating: number;
  feedbackByType: Record<string, number>;
  feedbackByStatus: Record<string, number>;
  topIssues: Array<{ title: string; count: number }>;
}> {
  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM user_feedback) as total_feedback,
      (SELECT AVG(rating) FROM user_feedback) as avg_rating,
      json_object_agg(type, count) FILTER (WHERE type IS NOT NULL) as feedback_by_type,
      json_object_agg(status, count) FILTER (WHERE status IS NOT NULL) as feedback_by_status
    FROM (
      SELECT type, COUNT(*) as count FROM user_feedback GROUP BY type
    ) t1
    CROSS JOIN (
      SELECT status, COUNT(*) as count FROM user_feedback GROUP BY status
    ) t2
  `);

  const stats = result.rows[0];

  // Get top issues
  const topIssuesResult = await pool.query(`
    SELECT title, COUNT(*) as count
    FROM user_feedback
    WHERE type = 'bug'
    GROUP BY title
    ORDER BY count DESC
    LIMIT 5
  `);

  return {
    totalFeedback: parseInt(stats.total_feedback),
    averageRating: parseFloat(stats.avg_rating) || 0,
    feedbackByType: stats.feedback_by_type || {},
    feedbackByStatus: stats.feedback_by_status || {},
    topIssues: topIssuesResult.rows,
  };
}

/**
 * Export feedback for analysis
 */
export async function exportFeedback(
  startDate: Date,
  endDate: Date
): Promise<UserFeedback[]> {
  const result = await pool.query(
    `SELECT * FROM user_feedback 
     WHERE created_at BETWEEN $1 AND $2
     ORDER BY created_at DESC`,
    [startDate, endDate]
  );

  return result.rows;
}
