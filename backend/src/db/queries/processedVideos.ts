import { query } from '../pool.js';
import { v4 as uuidv4 } from 'uuid';

export interface ProcessedVideo {
  id: string;
  video_id: string;
  processed_filename: string;
  processed_size_bytes?: number;
  processing_time_seconds?: number;
  vfx_style?: string;
  caption_font?: string;
  s3_url: string;
  download_expires_at: Date;
  created_at: Date;
}

export interface CreateProcessedVideoInput {
  videoId: string;
  processedFilename: string;
  processedSizeBytes?: number;
  processingTimeSeconds?: number;
  vfxStyle?: string;
  captionFont?: string;
  s3Url: string;
  downloadExpiresAt: Date;
}

/**
 * Create processed video record
 */
export async function createProcessedVideo(
  input: CreateProcessedVideoInput
): Promise<ProcessedVideo> {
  const id = uuidv4();
  const result = await query(
    `INSERT INTO processed_videos (
      id, video_id, processed_filename, processed_size_bytes, processing_time_seconds,
      vfx_style, caption_font, s3_url, download_expires_at, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
    RETURNING id, video_id, processed_filename, processed_size_bytes, processing_time_seconds,
              vfx_style, caption_font, s3_url, download_expires_at, created_at`,
    [
      id,
      input.videoId,
      input.processedFilename,
      input.processedSizeBytes || null,
      input.processingTimeSeconds || null,
      input.vfxStyle || null,
      input.captionFont || null,
      input.s3Url,
      input.downloadExpiresAt,
    ]
  );

  return result.rows[0];
}

/**
 * Get processed video by video ID
 */
export async function getProcessedVideoByVideoId(
  videoId: string
): Promise<ProcessedVideo | null> {
  const result = await query(
    `SELECT id, video_id, processed_filename, processed_size_bytes, processing_time_seconds,
            vfx_style, caption_font, s3_url, download_expires_at, created_at
     FROM processed_videos
     WHERE video_id = $1`,
    [videoId]
  );

  return result.rows[0] || null;
}

/**
 * Get processed video by ID
 */
export async function getProcessedVideoById(id: string): Promise<ProcessedVideo | null> {
  const result = await query(
    `SELECT id, video_id, processed_filename, processed_size_bytes, processing_time_seconds,
            vfx_style, caption_font, s3_url, download_expires_at, created_at
     FROM processed_videos
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

/**
 * Update processed video
 */
export async function updateProcessedVideo(
  id: string,
  input: Partial<CreateProcessedVideoInput>
): Promise<ProcessedVideo | null> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (input.processedFilename) {
    updates.push(`processed_filename = $${paramCount}`);
    values.push(input.processedFilename);
    paramCount++;
  }

  if (input.processedSizeBytes !== undefined) {
    updates.push(`processed_size_bytes = $${paramCount}`);
    values.push(input.processedSizeBytes);
    paramCount++;
  }

  if (input.processingTimeSeconds !== undefined) {
    updates.push(`processing_time_seconds = $${paramCount}`);
    values.push(input.processingTimeSeconds);
    paramCount++;
  }

  if (input.s3Url) {
    updates.push(`s3_url = $${paramCount}`);
    values.push(input.s3Url);
    paramCount++;
  }

  if (input.downloadExpiresAt) {
    updates.push(`download_expires_at = $${paramCount}`);
    values.push(input.downloadExpiresAt);
    paramCount++;
  }

  if (updates.length === 0) {
    return getProcessedVideoById(id);
  }

  values.push(id);

  const result = await query(
    `UPDATE processed_videos
     SET ${updates.join(', ')}
     WHERE id = $${paramCount}
     RETURNING id, video_id, processed_filename, processed_size_bytes, processing_time_seconds,
               vfx_style, caption_font, s3_url, download_expires_at, created_at`,
    values
  );

  return result.rows[0] || null;
}

/**
 * Delete processed video
 */
export async function deleteProcessedVideo(id: string): Promise<boolean> {
  const result = await query(
    `DELETE FROM processed_videos WHERE id = $1`,
    [id]
  );

  return result.rowCount! > 0;
}

/**
 * Get processed videos by VFX style
 */
export async function getProcessedVideosByVfxStyle(
  vfxStyle: string
): Promise<ProcessedVideo[]> {
  const result = await query(
    `SELECT id, video_id, processed_filename, processed_size_bytes, processing_time_seconds,
            vfx_style, caption_font, s3_url, download_expires_at, created_at
     FROM processed_videos
     WHERE vfx_style = $1
     ORDER BY created_at DESC`,
    [vfxStyle]
  );

  return result.rows;
}

/**
 * Get expired processed videos
 */
export async function getExpiredProcessedVideos(): Promise<ProcessedVideo[]> {
  const result = await query(
    `SELECT id, video_id, processed_filename, processed_size_bytes, processing_time_seconds,
            vfx_style, caption_font, s3_url, download_expires_at, created_at
     FROM processed_videos
     WHERE download_expires_at < CURRENT_TIMESTAMP`
  );

  return result.rows;
}

/**
 * Get average processing time
 */
export async function getAverageProcessingTime(): Promise<number> {
  const result = await query(
    `SELECT AVG(processing_time_seconds) as avg_time FROM processed_videos`
  );

  return parseFloat(result.rows[0].avg_time) || 0;
}
