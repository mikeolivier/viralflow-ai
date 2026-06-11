import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { createUserFeedback, updateUserFeedback, getFeedbackStatistics } from '../db/queries/userFeedback.js';
import { getProcessedVideoByVideoId } from '../db/queries/processedVideos.js';
import { getVideoById } from '../db/queries/videos.js';

const router = Router();

// Validation schemas
const feedbackSchema = z.object({
  videoId: z.string().uuid('Invalid video ID'),
  satisfactionScore: z.number().min(1).max(5, 'Score must be between 1 and 5'),
  downloaded: z.boolean().optional(),
  reUploaded: z.boolean().optional(),
  notes: z.string().max(500, 'Notes must be under 500 characters').optional(),
});

/**
 * POST /api/feedback
 * Submit feedback for a processed video
 */
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized');
    }

    // Validate request body
    const validation = feedbackSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError(400, validation.error.errors[0].message);
    }

    const { videoId, satisfactionScore, downloaded, reUploaded, notes } = validation.data;

    // Verify video ownership
    const video = await getVideoById(videoId);
    if (!video) {
      throw new AppError(404, 'Video not found');
    }

    if (video.user_id !== req.user.userId) {
      throw new AppError(403, 'Forbidden');
    }

    // Get processed video
    const processedVideo = await getProcessedVideoByVideoId(videoId);
    if (!processedVideo) {
      throw new AppError(404, 'Processed video not found');
    }

    // Create feedback
    const feedback = await createUserFeedback({
      processedVideoId: processedVideo.id,
      satisfactionScore,
      downloaded,
      reUploaded,
      notes,
    });

    res.status(201).json({
      feedback: {
        id: feedback.id,
        satisfactionScore: feedback.satisfaction_score,
        downloaded: feedback.downloaded,
        reUploaded: feedback.re_uploaded,
        createdAt: feedback.created_at,
      },
    });
  })
);

/**
 * GET /api/feedback/statistics
 * Get feedback statistics
 */
router.get(
  '/statistics',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const stats = await getFeedbackStatistics();

    res.json({
      statistics: {
        totalFeedback: stats.totalFeedback,
        averageSatisfaction: stats.averageSatisfaction.toFixed(2),
        reuploadRate: (stats.reuploadRate * 100).toFixed(2) + '%',
        downloadRate: (stats.downloadRate * 100).toFixed(2) + '%',
      },
    });
  })
);

export default router;
