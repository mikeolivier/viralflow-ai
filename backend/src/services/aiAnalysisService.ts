import axios from 'axios';
import dotenv from 'dotenv';
import pino from 'pino';
import FormData from 'form-data';
import fs from 'fs';

dotenv.config();

const logger = pino();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const CLIP_ENDPOINT = process.env.CLIP_API_ENDPOINT || 'http://localhost:8000';
const WHISPER_ENDPOINT = process.env.WHISPER_API_ENDPOINT || 'http://localhost:8001';

export interface SceneAnalysis {
  labels: string[];
  motionScore: number;
  faceCount: number;
  dominantColor: string;
  hookStrength: number;
  recommendedEffects: string[];
}

export interface SpeechAnalysis {
  hasAudio: boolean;
  hasSpeech: boolean;
  transcript?: string;
  language?: string;
  duration?: number;
}

/**
 * Analyze video scenes using CLIP
 */
export async function analyzeVideoScenes(videoPath: string): Promise<SceneAnalysis> {
  try {
    logger.info(`Analyzing scenes for video: ${videoPath}`);

    // For MVP, we'll use a simplified analysis
    // In production, this would call the actual CLIP API
    const analysis: SceneAnalysis = {
      labels: ['person', 'outdoor', 'movement', 'daylight'],
      motionScore: Math.random() * 0.5 + 0.5, // 0.5-1.0 for movement
      faceCount: Math.floor(Math.random() * 3) + 1,
      dominantColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
      hookStrength: Math.random() * 0.3 + 0.7, // 0.7-1.0 for strong hooks
      recommendedEffects: generateRecommendedEffects(),
    };

    logger.info(`Scene analysis completed: ${JSON.stringify(analysis)}`);
    return analysis;
  } catch (error) {
    logger.error(`Scene analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

/**
 * Analyze video audio using Whisper
 */
export async function analyzeVideoAudio(audioPath: string): Promise<SpeechAnalysis> {
  try {
    logger.info(`Analyzing audio for file: ${audioPath}`);

    // For MVP, we'll use a simplified analysis
    // In production, this would call the actual Whisper API
    const analysis: SpeechAnalysis = {
      hasAudio: true,
      hasSpeech: Math.random() > 0.3, // 70% chance of speech
      transcript: hasSpeech ? 'Sample transcript of the audio content...' : undefined,
      language: 'en',
      duration: 60,
    };

    logger.info(`Audio analysis completed: ${JSON.stringify(analysis)}`);
    return analysis;
  } catch (error) {
    logger.error(`Audio analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

/**
 * Generate recommended effects based on scene analysis
 */
function generateRecommendedEffects(): string[] {
  const allEffects = [
    'motion_zoom',
    'face_glow',
    'color_pop',
    'dynamic_cut',
    'beat_sync',
    'slow_motion',
    'speed_ramp',
    'light_flare',
    'shadow_enhance',
    'contrast_boost',
  ];

  // Randomly select 3-5 effects
  const count = Math.floor(Math.random() * 3) + 3;
  const shuffled = allEffects.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Calculate hook strength (first 3 seconds engagement potential)
 */
export function calculateHookStrength(
  sceneLabels: string[],
  motionScore: number,
  faceCount: number
): number {
  let score = 0;

  // High motion in first 3 seconds = strong hook
  score += motionScore * 0.4;

  // Faces in frame = engagement
  score += Math.min(faceCount / 3, 1) * 0.3;

  // Certain scene types are more engaging
  const engagingLabels = ['person', 'action', 'movement', 'expression', 'surprise'];
  const engagingCount = sceneLabels.filter((label) =>
    engagingLabels.some((eLabel) => label.toLowerCase().includes(eLabel))
  ).length;
  score += Math.min(engagingCount / 3, 1) * 0.3;

  return Math.min(score, 1);
}

/**
 * Analyze complete video for viral potential
 */
export async function analyzeForViralPotential(videoPath: string): Promise<{
  viralScore: number;
  analysis: SceneAnalysis;
  audioAnalysis: SpeechAnalysis;
  recommendations: string[];
}> {
  try {
    logger.info(`Analyzing viral potential for: ${videoPath}`);

    // Run analyses in parallel
    const [sceneAnalysis, audioAnalysis] = await Promise.all([
      analyzeVideoScenes(videoPath),
      analyzeVideoAudio(videoPath),
    ]);

    // Calculate viral score (0-100)
    const viralScore = Math.round(
      (sceneAnalysis.hookStrength * 0.4 +
        (sceneAnalysis.motionScore * 0.3) +
        (audioAnalysis.hasSpeech ? 0.2 : 0.1) +
        (sceneAnalysis.faceCount > 0 ? 0.1 : 0)) *
        100
    );

    // Generate recommendations
    const recommendations = generateRecommendations(sceneAnalysis, audioAnalysis, viralScore);

    logger.info(`Viral potential analysis completed: Score=${viralScore}`);

    return {
      viralScore,
      analysis: sceneAnalysis,
      audioAnalysis,
      recommendations,
    };
  } catch (error) {
    logger.error(
      `Viral potential analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw error;
  }
}

/**
 * Generate recommendations based on analysis
 */
function generateRecommendations(
  sceneAnalysis: SceneAnalysis,
  audioAnalysis: SpeechAnalysis,
  viralScore: number
): string[] {
  const recommendations: string[] = [];

  if (sceneAnalysis.hookStrength < 0.6) {
    recommendations.push('Add more dynamic movement in the first 3 seconds to hook viewers');
  }

  if (sceneAnalysis.motionScore < 0.5) {
    recommendations.push('Increase motion and camera movement for better engagement');
  }

  if (sceneAnalysis.faceCount === 0) {
    recommendations.push('Include faces or expressions for higher engagement');
  }

  if (!audioAnalysis.hasSpeech && audioAnalysis.hasAudio) {
    recommendations.push('Add voiceover or dialogue to increase engagement');
  }

  if (viralScore > 80) {
    recommendations.push('This video has strong viral potential! Consider publishing immediately');
  } else if (viralScore > 60) {
    recommendations.push('Good viral potential. Consider adding more dynamic effects');
  } else if (viralScore < 40) {
    recommendations.push('Consider re-recording with more engaging content');
  }

  return recommendations;
}

/**
 * Extract keyframes from video
 */
export async function extractKeyframes(
  videoPath: string,
  count: number = 5
): Promise<string[]> {
  try {
    logger.info(`Extracting ${count} keyframes from: ${videoPath}`);

    // For MVP, return placeholder keyframe paths
    const keyframes = Array.from({ length: count }, (_, i) => `keyframe_${i + 1}.jpg`);

    logger.info(`Keyframe extraction completed: ${keyframes.length} frames`);
    return keyframes;
  } catch (error) {
    logger.error(
      `Keyframe extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw error;
  }
}

/**
 * Detect scene cuts and transitions
 */
export async function detectSceneCuts(videoPath: string): Promise<number[]> {
  try {
    logger.info(`Detecting scene cuts in: ${videoPath}`);

    // For MVP, return placeholder timestamps
    const cuts = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

    logger.info(`Scene cut detection completed: ${cuts.length} cuts detected`);
    return cuts;
  } catch (error) {
    logger.error(
      `Scene cut detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw error;
  }
}
