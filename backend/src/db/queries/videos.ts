import { query } from '../pool.js';
import { v4 as uuidv4 } from 'uuid';

export interface Video {
  id: string;
  user_id: string;
  original_filename: string;
  original_size_bytes?: number;
  duration_seconds?: number;
  aspect_ratio?: string;
  upload_status: string;
  error_message?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateVideoInput {
  userId: string;
  originalFilename: string;
  originalSizeBytes?: number;
}

/**
 * Create a new video record
 */
export async function createVideo(input: CreateVideoInput): Promise<Video> {
  const id = uuidv4();
  const result = await query(
    `INSERT INTO videos (id, user_id, original_filename, original_size_bytes, upload_status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     RETURNING id, user_id, original_filename, original_size_bytes, duration_seconds, aspect_ratio, upload_status, error_message, created_at, updated_at`,
    [id, input.userId, input.originalFilename, input.originalSizeBytes || null, 'pending']
  );

  return result.rows[0];
}

/**
 * Get video by ID
 */
export async function getVideoById(videoId: string): Promise<Video | null> {
  const result = await query(
    `SELECT id, user_id, original_filename, original_size_bytes, duration_seconds, aspect_ratio, upload_status, error_message, created_at, updated_at
     FROM videos
     WHERE id = $1 AND deleted_at IS NULL`,
    [videoId]
  );

  return result.rows[0] || null;
}

/**
 * Get videos by user ID
 */
export async function getVideosByUserId(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ videos: Video[]; total: number }> {
  const countResult = await query(
    `SELECT COUNT(*) as count FROM videos WHERE user_id = $1 AND deleted_at IS NULL`,
    [userId]
  );

  const videosResult = await query(
    `SELECT id, user_id, original_filename, original_size_bytes, duration_seconds, aspect_ratio, upload_status, error_message, created_at, updated_at
     FROM videos
     WHERE user_id = $1 AND deleted_at IS NULL
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return {
    videos: videosResult.rows,
    total: parseInt(countResult.rows[0].count, 10),
  };
}

/**
 * Update video status
 */
export async function updateVideoStatus(
  videoId: string,
  status: string,
  errorMessage?: string
): Promise<Video | null> {
  const result = await query(
    `UPDATE videos
     SET upload_status = $1, error_message = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = $3 AND deleted_at IS NULL
     RETURNING id, user_id, original_filename, original_size_bytes, duration_seconds, aspect_ratio, upload_status, error_message, created_at, updated_at`,
    [status, errorMessage || null, videoId]
  );

  return result.rows[0] || null;
}

/**
 * Update video metadata
 */
export async function updateVideoMetadata(
  videoId: string,
  metadata: {
    durationSeconds?: number;
    aspectRatio?: string;
  }
): Promise<Video | null> {
  const result = await query(
    `UPDATE videos
     SET duration_seconds = COALESCE($1, duration_seconds),
         aspect_ratio = COALESCE($2, aspect_ratio),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $3 AND deleted_at IS NULL
     RETURNING id, user_id, original_filename, original_size_bytes, duration_seconds, aspect_ratio, upload_status, error_message, created_at, updated_at`,
    [metadata.durationSeconds || null, metadata.aspectRatio || null, videoId]
  );

  return result.rows[0] || null;
}

/**
 * Delete video (soft delete)
 */
export async function deleteVideo(videoId: string): Promise<boolean> {
  const result = await query(
    `UPDATE videos
     SET deleted_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND deleted_at IS NULL`,
    [videoId]
  );

  return result.rowCount! > 0;
}

/**
 * Get videos by status
 */
export async function getVideosByStatus(
  status: string,
  limit: number = 100
): Promise<Video[]> {
  const result = await query(
    `SELECT id, user_id, original_filename, original_size_bytes, duration_seconds, aspect_ratio, upload_status, error_message, created_at, updated_at
     FROM videos
     WHERE upload_status = $1 AND deleted_at IS NULL
     ORDER BY created_at ASC
     LIMIT $2`,
    [status, limit]
  );

  return result.rows;
}

/**
 * Get user's video count
 */
export async function getUserVideoCount(userId: string): Promise<number> {
  const result = await query(
    `SELECT COUNT(*) as count FROM videos WHERE user_id = $1 AND deleted_at IS NULL`,
    [userId]
  );

  return parseInt(result.rows[0].count, 10);
}
