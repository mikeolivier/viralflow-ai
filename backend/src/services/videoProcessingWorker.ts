import Bull from 'bull';
import pino from 'pino';
import path from 'path';
import os from 'os';
import fs from 'fs';
import dotenv from 'dotenv';

import { VideoProcessingJob, processingQueue } from './processingQueue.js';
import { getVideoMetadata, transcodeToMp4, applyVFXEffects } from './ffmpegService.js';
import { analyzeForViralPotential } from './aiAnalysisService.js';
import {
  downloadFileToBuffer,
  uploadFileFromBuffer,
  generateDownloadPresignedUrl,
  deleteFile,
} from './s3Service.js';
import { updateVideoStatus, updateVideoMetadata } from '../db/queries/videos.js';
import { createVideoAnalysis } from '../db/queries/videoAnalysis.js';
import { createProcessedVideo } from '../db/queries/processedVideos.js';
import { io } from '../index.js';

dotenv.config();

const logger = pino();
const TEMP_DIR = path.join(os.tmpdir(), 'viralflow-processing');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Process video job
 */
export async function processVideoJob(job: Bull.Job<VideoProcessingJob>): Promise<void> {
  const { videoId, userId, fileKey, originalFilename, vfxStyle = 'cinematic', captionFont = 'modern' } =
    job.data;

  const tempInputPath = path.join(TEMP_DIR, `input_${videoId}.mp4`);
  const tempProcessedPath = path.join(TEMP_DIR, `processed_${videoId}.mp4`);

  try {
    logger.info(`Starting video processing for ${videoId}`);

    // Update status to processing
    await updateVideoStatus(videoId, 'processing');
    emitProgress(videoId, 5, 'Downloading video');

    // Download video from S3
    const videoBuffer = await downloadFileToBuffer(fileKey);
    fs.writeFileSync(tempInputPath, videoBuffer);
    logger.info(`Video downloaded: ${tempInputPath}`);

    emitProgress(videoId, 15, 'Analyzing video metadata');

    // Get video metadata
    const metadata = await getVideoMetadata(tempInputPath);
    logger.info(`Video metadata: ${JSON.stringify(metadata)}`);

    // Update video metadata
    await updateVideoMetadata(videoId, {
      durationSeconds: metadata.duration,
      aspectRatio: `${metadata.width}:${metadata.height}`,
    });

    emitProgress(videoId, 25, 'Analyzing content with AI');

    // Run AI analysis
    const analysis = await analyzeForViralPotential(tempInputPath);
    logger.info(`AI analysis completed: ${JSON.stringify(analysis)}`);

    // Store analysis
    await createVideoAnalysis({
      videoId,
      sceneLabels: analysis.analysis.labels,
      motionScore: analysis.analysis.motionScore,
      faceCount: analysis.analysis.faceCount,
      audioHasSpeech: analysis.audioAnalysis.hasSpeech,
      dominantColor: analysis.analysis.dominantColor,
      hookStrength: analysis.analysis.hookStrength,
      recommendedEffects: analysis.analysis.recommendedEffects,
      analysisMetadata: {
        viralScore: analysis.viralScore,
        recommendations: analysis.recommendations,
      },
    });

    emitProgress(videoId, 40, 'Transcoding video');

    // Transcode to MP4
    await transcodeToMp4(tempInputPath, tempProcessedPath, { quality: 'high' }, (percent) => {
      emitProgress(videoId, 40 + Math.round(percent * 0.25), 'Transcoding video');
    });

    emitProgress(videoId, 65, 'Applying VFX effects');

    // Apply VFX effects
    const tempVfxPath = path.join(TEMP_DIR, `vfx_${videoId}.mp4`);
    await applyVFXEffects(tempProcessedPath, tempVfxPath, vfxStyle as any, (percent) => {
      emitProgress(videoId, 65 + Math.round(percent * 0.25), 'Applying VFX effects');
    });

    emitProgress(videoId, 90, 'Uploading processed video');

    // Upload to S3
    const processedBuffer = fs.readFileSync(tempVfxPath);
    const outputFileKey = `outputs/${userId}/${videoId}-${originalFilename}`;
    await uploadFileFromBuffer(outputFileKey, processedBuffer, 'video/mp4');

    // Generate download URL
    const downloadExpiresAt = new Date();
    downloadExpiresAt.setDate(downloadExpiresAt.getDate() + 7);
    const { downloadUrl } = await generateDownloadPresignedUrl(outputFileKey);

    // Create processed video record
    await createProcessedVideo({
      videoId,
      processedFilename: `processed_${originalFilename}`,
      processedSizeBytes: processedBuffer.length,
      processingTimeSeconds: (Date.now() - job.timestamp) / 1000,
      vfxStyle,
      captionFont,
      s3Url: downloadUrl,
      downloadExpiresAt,
    });

    // Update video status to completed
    await updateVideoStatus(videoId, 'completed');

    emitProgress(videoId, 100, 'Processing complete');

    logger.info(`Video processing completed for ${videoId}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Video processing failed for ${videoId}: ${errorMessage}`);

    // Update status to failed
    await updateVideoStatus(videoId, 'failed', errorMessage);
    emitProgress(videoId, 0, `Processing failed: ${errorMessage}`);

    throw error;
  } finally {
    // Cleanup temp files
    try {
      if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
      if (fs.existsSync(tempProcessedPath)) fs.unlinkSync(tempProcessedPath);
      const tempVfxPath = path.join(TEMP_DIR, `vfx_${videoId}.mp4`);
      if (fs.existsSync(tempVfxPath)) fs.unlinkSync(tempVfxPath);
    } catch (cleanupError) {
      logger.warn(`Cleanup failed for ${videoId}: ${cleanupError}`);
    }
  }
}

/**
 * Emit progress update via WebSocket
 */
function emitProgress(videoId: string, progress: number, status: string): void {
  io.to(`video-${videoId}`).emit('video-progress', {
    videoId,
    progress: Math.min(progress, 100),
    status,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Setup video processing worker
 */
export async function setupVideoProcessingWorker(): Promise<void> {
  logger.info('Setting up video processing worker');

  // Process jobs with concurrency of 1 (one video at a time)
  processingQueue.process(1, async (job) => {
    await processVideoJob(job);
  });

  // Handle job completion
  processingQueue.on('completed', (job) => {
    logger.info(`Job ${job.id} completed for video ${job.data.videoId}`);
  });

  // Handle job failure
  processingQueue.on('failed', (job, err) => {
    logger.error(`Job ${job.id} failed for video ${job.data.videoId}: ${err.message}`);
  });

  logger.info('Video processing worker ready');
}

/**
 * Cleanup processing worker
 */
export async function cleanupVideoProcessingWorker(): Promise<void> {
  logger.info('Cleaning up video processing worker');

  // Clean up temp directory
  try {
    if (fs.existsSync(TEMP_DIR)) {
      const files = fs.readdirSync(TEMP_DIR);
      for (const file of files) {
        fs.unlinkSync(path.join(TEMP_DIR, file));
      }
      fs.rmdirSync(TEMP_DIR);
    }
  } catch (error) {
    logger.warn(`Failed to cleanup temp directory: ${error}`);
  }

  logger.info('Video processing worker cleaned up');
}
