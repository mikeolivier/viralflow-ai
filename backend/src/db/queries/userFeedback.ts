import { query } from '../pool.js';
import { v4 as uuidv4 } from 'uuid';

export interface UserFeedback {
  id: string;
  processed_video_id: string;
  satisfaction_score: number;
  downloaded: boolean;
  re_uploaded: boolean;
  notes?: string;
  created_at: Date;
}

export interface CreateUserFeedbackInput {
  processedVideoId: string;
  satisfactionScore: number;
  downloaded?: boolean;
  reUploaded?: boolean;
  notes?: string;
}

/**
 * Create user feedback record
 */
export async function createUserFeedback(
  input: CreateUserFeedbackInput
): Promise<UserFeedback> {
  const id = uuidv4();
  const result = await query(
    `INSERT INTO user_feedback (id, processed_video_id, satisfaction_score, downloaded, re_uploaded, notes, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
     RETURNING id, processed_video_id, satisfaction_score, downloaded, re_uploaded, notes, created_at`,
    [
      id,
      input.processedVideoId,
      input.satisfactionScore,
      input.downloaded || false,
      input.reUploaded || false,
      input.notes || null,
    ]
  );

  return result.rows[0];
}

/**
 * Get feedback by ID
 */
export async function getFeedbackById(feedbackId: string): Promise<UserFeedback | null> {
  const result = await query(
    `SELECT id, processed_video_id, satisfaction_score, downloaded, re_uploaded, notes, created_at
     FROM user_feedback
     WHERE id = $1`,
    [feedbackId]
  );

  return result.rows[0] || null;
}

/**
 * Get feedback by processed video ID
 */
export async function getFeedbackByProcessedVideoId(
  processedVideoId: string
): Promise<UserFeedback | null> {
  const result = await query(
    `SELECT id, processed_video_id, satisfaction_score, downloaded, re_uploaded, notes, created_at
     FROM user_feedback
     WHERE processed_video_id = $1`,
    [processedVideoId]
  );

  return result.rows[0] || null;
}

/**
 * Update user feedback
 */
export async function updateUserFeedback(
  feedbackId: string,
  input: Partial<CreateUserFeedbackInput>
): Promise<UserFeedback | null> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (input.satisfactionScore !== undefined) {
    updates.push(`satisfaction_score = $${paramCount}`);
    values.push(input.satisfactionScore);
    paramCount++;
  }

  if (input.downloaded !== undefined) {
    updates.push(`downloaded = $${paramCount}`);
    values.push(input.downloaded);
    paramCount++;
  }

  if (input.reUploaded !== undefined) {
    updates.push(`re_uploaded = $${paramCount}`);
    values.push(input.reUploaded);
    paramCount++;
  }

  if (input.notes !== undefined) {
    updates.push(`notes = $${paramCount}`);
    values.push(input.notes);
    paramCount++;
  }

  if (updates.length === 0) {
    return getFeedbackById(feedbackId);
  }

  values.push(feedbackId);

  const result = await query(
    `UPDATE user_feedback
     SET ${updates.join(', ')}
     WHERE id = $${paramCount}
     RETURNING id, processed_video_id, satisfaction_score, downloaded, re_uploaded, notes, created_at`,
    values
  );

  return result.rows[0] || null;
}

/**
 * Get average satisfaction score
 */
export async function getAverageSatisfactionScore(): Promise<number> {
  const result = await query(
    `SELECT AVG(satisfaction_score) as avg_score FROM user_feedback`
  );

  return parseFloat(result.rows[0].avg_score) || 0;
}

/**
 * Get re-upload rate
 */
export async function getReuploadRate(): Promise<number> {
  const result = await query(
    `SELECT 
      COUNT(CASE WHEN re_uploaded = true THEN 1 END)::float / COUNT(*) as reupload_rate
     FROM user_feedback
     WHERE created_at > NOW() - INTERVAL '30 days'`
  );

  return parseFloat(result.rows[0].reupload_rate) || 0;
}

/**
 * Get download rate
 */
export async function getDownloadRate(): Promise<number> {
  const result = await query(
    `SELECT 
      COUNT(CASE WHEN downloaded = true THEN 1 END)::float / COUNT(*) as download_rate
     FROM user_feedback
     WHERE created_at > NOW() - INTERVAL '30 days'`
  );

  return parseFloat(result.rows[0].download_rate) || 0;
}

/**
 * Get feedback by satisfaction score range
 */
export async function getFeedbackBySatisfactionRange(
  minScore: number,
  maxScore: number
): Promise<UserFeedback[]> {
  const result = await query(
    `SELECT id, processed_video_id, satisfaction_score, downloaded, re_uploaded, notes, created_at
     FROM user_feedback
     WHERE satisfaction_score >= $1 AND satisfaction_score <= $2
     ORDER BY created_at DESC`,
    [minScore, maxScore]
  );

  return result.rows;
}

/**
 * Get feedback statistics
 */
export async function getFeedbackStatistics(): Promise<{
  totalFeedback: number;
  averageSatisfaction: number;
  reuploadRate: number;
  downloadRate: number;
}> {
  const result = await query(
    `SELECT 
      COUNT(*) as total_feedback,
      AVG(satisfaction_score) as avg_satisfaction,
      COUNT(CASE WHEN re_uploaded = true THEN 1 END)::float / COUNT(*) as reupload_rate,
      COUNT(CASE WHEN downloaded = true THEN 1 END)::float / COUNT(*) as download_rate
     FROM user_feedback
     WHERE created_at > NOW() - INTERVAL '30 days'`
  );

  const row = result.rows[0];
  return {
    totalFeedback: parseInt(row.total_feedback, 10),
    averageSatisfaction: parseFloat(row.avg_satisfaction) || 0,
    reuploadRate: parseFloat(row.reupload_rate) || 0,
    downloadRate: parseFloat(row.download_rate) || 0,
  };
}
