import { query } from '../pool.js';
import { v4 as uuidv4 } from 'uuid';

export interface VideoAnalysis {
  id: string;
  video_id: string;
  scene_labels: string[];
  motion_score: number;
  face_count: number;
  audio_has_speech: boolean;
  dominant_color: string;
  hook_strength: number;
  recommended_effects: string[];
  analysis_metadata: Record<string, any>;
  created_at: Date;
}

export interface CreateVideoAnalysisInput {
  videoId: string;
  sceneLabels: string[];
  motionScore: number;
  faceCount: number;
  audioHasSpeech: boolean;
  dominantColor: string;
  hookStrength: number;
  recommendedEffects: string[];
  analysisMetadata?: Record<string, any>;
}

/**
 * Create video analysis record
 */
export async function createVideoAnalysis(
  input: CreateVideoAnalysisInput
): Promise<VideoAnalysis> {
  const id = uuidv4();
  const result = await query(
    `INSERT INTO video_analysis (
      id, video_id, scene_labels, motion_score, face_count, audio_has_speech,
      dominant_color, hook_strength, recommended_effects, analysis_metadata, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
    RETURNING id, video_id, scene_labels, motion_score, face_count, audio_has_speech,
              dominant_color, hook_strength, recommended_effects, analysis_metadata, created_at`,
    [
      id,
      input.videoId,
      input.sceneLabels,
      input.motionScore,
      input.faceCount,
      input.audioHasSpeech,
      input.dominantColor,
      input.hookStrength,
      input.recommendedEffects,
      JSON.stringify(input.analysisMetadata || {}),
    ]
  );

  return result.rows[0];
}

/**
 * Get analysis by video ID
 */
export async function getAnalysisByVideoId(videoId: string): Promise<VideoAnalysis | null> {
  const result = await query(
    `SELECT id, video_id, scene_labels, motion_score, face_count, audio_has_speech,
            dominant_color, hook_strength, recommended_effects, analysis_metadata, created_at
     FROM video_analysis
     WHERE video_id = $1`,
    [videoId]
  );

  return result.rows[0] || null;
}

/**
 * Update video analysis
 */
export async function updateVideoAnalysis(
  videoId: string,
  input: Partial<CreateVideoAnalysisInput>
): Promise<VideoAnalysis | null> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (input.sceneLabels) {
    updates.push(`scene_labels = $${paramCount}`);
    values.push(input.sceneLabels);
    paramCount++;
  }

  if (input.motionScore !== undefined) {
    updates.push(`motion_score = $${paramCount}`);
    values.push(input.motionScore);
    paramCount++;
  }

  if (input.faceCount !== undefined) {
    updates.push(`face_count = $${paramCount}`);
    values.push(input.faceCount);
    paramCount++;
  }

  if (input.audioHasSpeech !== undefined) {
    updates.push(`audio_has_speech = $${paramCount}`);
    values.push(input.audioHasSpeech);
    paramCount++;
  }

  if (input.dominantColor) {
    updates.push(`dominant_color = $${paramCount}`);
    values.push(input.dominantColor);
    paramCount++;
  }

  if (input.hookStrength !== undefined) {
    updates.push(`hook_strength = $${paramCount}`);
    values.push(input.hookStrength);
    paramCount++;
  }

  if (input.recommendedEffects) {
    updates.push(`recommended_effects = $${paramCount}`);
    values.push(input.recommendedEffects);
    paramCount++;
  }

  if (updates.length === 0) {
    return getAnalysisByVideoId(videoId);
  }

  values.push(videoId);

  const result = await query(
    `UPDATE video_analysis
     SET ${updates.join(', ')}
     WHERE video_id = $${paramCount}
     RETURNING id, video_id, scene_labels, motion_score, face_count, audio_has_speech,
               dominant_color, hook_strength, recommended_effects, analysis_metadata, created_at`,
    values
  );

  return result.rows[0] || null;
}

/**
 * Get analyses by scene label
 */
export async function getAnalysesBySceneLabel(label: string): Promise<VideoAnalysis[]> {
  const result = await query(
    `SELECT id, video_id, scene_labels, motion_score, face_count, audio_has_speech,
            dominant_color, hook_strength, recommended_effects, analysis_metadata, created_at
     FROM video_analysis
     WHERE $1 = ANY(scene_labels)
     ORDER BY created_at DESC`,
    [label]
  );

  return result.rows;
}

/**
 * Get high-motion videos
 */
export async function getHighMotionVideos(threshold: number = 0.7): Promise<VideoAnalysis[]> {
  const result = await query(
    `SELECT id, video_id, scene_labels, motion_score, face_count, audio_has_speech,
            dominant_color, hook_strength, recommended_effects, analysis_metadata, created_at
     FROM video_analysis
     WHERE motion_score >= $1
     ORDER BY motion_score DESC`,
    [threshold]
  );

  return result.rows;
}

/**
 * Get videos with strong hooks
 */
export async function getVideosWithStrongHooks(threshold: number = 0.7): Promise<VideoAnalysis[]> {
  const result = await query(
    `SELECT id, video_id, scene_labels, motion_score, face_count, audio_has_speech,
            dominant_color, hook_strength, recommended_effects, analysis_metadata, created_at
     FROM video_analysis
     WHERE hook_strength >= $1
     ORDER BY hook_strength DESC`,
    [threshold]
  );

  return result.rows;
}
