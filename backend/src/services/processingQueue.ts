import Bull from 'bull';
import dotenv from 'dotenv';
import pino from 'pino';

dotenv.config();

const logger = pino();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export interface VideoProcessingJob {
  videoId: string;
  userId: string;
  fileKey: string;
  originalFilename: string;
  vfxStyle?: string;
  captionFont?: string;
}

// Create processing queue
export const processingQueue = new Bull<VideoProcessingJob>('video-processing', redisUrl);

// Queue event handlers
processingQueue.on('active', (job) => {
  logger.info(`Processing started for video ${job.data.videoId}`);
});

processingQueue.on('completed', (job) => {
  logger.info(`Processing completed for video ${job.data.videoId}`);
});

processingQueue.on('failed', (job, err) => {
  logger.error(`Processing failed for video ${job.data.videoId}: ${err.message}`);
});

processingQueue.on('error', (err) => {
  logger.error(`Queue error: ${err.message}`);
});

/**
 * Add video to processing queue
 */
export async function addVideoToQueue(
  data: VideoProcessingJob,
  priority: number = 1
): Promise<Bull.Job<VideoProcessingJob>> {
  const job = await processingQueue.add(data, {
    priority,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: false,
    removeOnFail: false,
  });

  logger.info(`Video ${data.videoId} added to processing queue with job ID ${job.id}`);
  return job;
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string): Promise<{
  state: string;
  progress: number;
  data?: any;
  error?: string;
}> {
  const job = await processingQueue.getJob(jobId);

  if (!job) {
    throw new Error('Job not found');
  }

  const state = await job.getState();
  const progress = job.progress();

  return {
    state,
    progress,
    data: job.data,
    error: job.failedReason,
  };
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}> {
  const counts = await processingQueue.getJobCounts();

  return {
    waiting: counts.waiting,
    active: counts.active,
    completed: counts.completed,
    failed: counts.failed,
    delayed: counts.delayed,
  };
}

/**
 * Clear queue
 */
export async function clearQueue(): Promise<void> {
  await processingQueue.clean(0, 'completed');
  await processingQueue.clean(0, 'failed');
  logger.info('Queue cleared');
}

/**
 * Close queue connection
 */
export async function closeQueue(): Promise<void> {
  await processingQueue.close();
  logger.info('Processing queue closed');
}

export default processingQueue;
