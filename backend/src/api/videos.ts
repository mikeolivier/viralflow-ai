import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { generateUploadPresignedUrl, generateDownloadPresignedUrl } from '../services/s3Service.js';
import { createVideo, getVideoById, getVideosByUserId, deleteVideo } from '../db/queries/videos.js';

const router = Router();

// Validation schemas
const uploadSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  fileSize: z.number().positive('File size must be positive'),
});

const MAX_VIDEO_SIZE = parseInt(process.env.MAX_VIDEO_SIZE_MB || '500', 10) * 1024 * 1024;
const SUPPORTED_FORMATS = (process.env.SUPPORTED_VIDEO_FORMATS || 'mp4,webm,mov').split(',');

/**
 * POST /api/videos/upload
 * Generate presigned URL for video upload
 */
router.post(
  '/upload',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized');
    }

    // Validate request body
    const validation = uploadSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError(400, validation.error.errors[0].message);
    }

    const { filename, fileSize } = validation.data;

    // Validate file size
    if (fileSize > MAX_VIDEO_SIZE) {
      throw new AppError(
        400,
        `File size exceeds maximum allowed size of ${process.env.MAX_VIDEO_SIZE_MB}MB`
      );
    }

    // Validate file format
    const fileExtension = filename.split('.').pop()?.toLowerCase();
    if (!fileExtension || !SUPPORTED_FORMATS.includes(fileExtension)) {
      throw new AppError(
        400,
        `Unsupported file format. Supported formats: ${SUPPORTED_FORMATS.join(', ')}`
      );
    }

    // Create video record
    const video = await createVideo({
      userId: req.user.userId,
      originalFilename: filename,
      originalSizeBytes: fileSize,
    });

    // Generate presigned upload URL
    const { uploadUrl, fileKey, expiresAt } = await generateUploadPresignedUrl(
      req.user.userId,
      filename
    );

    res.status(201).json({
      video: {
        id: video.id,
        status: video.upload_status,
        createdAt: video.created_at,
      },
      upload: {
        url: uploadUrl,
        fileKey,
        expiresAt,
      },
    });
  })
);

/**
 * GET /api/videos/:videoId/status
 * Get video processing status
 */
router.get(
  '/:videoId/status',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized');
    }

    const { videoId } = req.params;

    // Get video
    const video = await getVideoById(videoId);
    if (!video) {
      throw new AppError(404, 'Video not found');
    }

    // Verify ownership
    if (video.user_id !== req.user.userId) {
      throw new AppError(403, 'Forbidden');
    }

    res.json({
      video: {
        id: video.id,
        status: video.upload_status,
        errorMessage: video.error_message,
        duration: video.duration_seconds,
        aspectRatio: video.aspect_ratio,
        createdAt: video.created_at,
        updatedAt: video.updated_at,
      },
    });
  })
);

/**
 * GET /api/videos/:videoId/result
 * Get processed video result
 */
router.get(
  '/:videoId/result',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized');
    }

    const { videoId } = req.params;

    // Get video
    const video = await getVideoById(videoId);
    if (!video) {
      throw new AppError(404, 'Video not found');
    }

    // Verify ownership
    if (video.user_id !== req.user.userId) {
      throw new AppError(403, 'Forbidden');
    }

    if (video.upload_status !== 'completed') {
      throw new AppError(400, 'Video processing not completed');
    }

    // TODO: Get processed video from database and generate download URL
    res.json({
      result: {
        videoId: video.id,
        status: 'completed',
        downloadUrl: 'coming-soon',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  })
);

/**
 * GET /api/videos
 * List user's videos
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const { videos, total } = await getVideosByUserId(req.user.userId, limit, offset);

    res.json({
      videos: videos.map((v) => ({
        id: v.id,
        filename: v.original_filename,
        status: v.upload_status,
        size: v.original_size_bytes,
        duration: v.duration_seconds,
        createdAt: v.created_at,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  })
);

/**
 * DELETE /api/videos/:videoId
 * Delete a video
 */
router.delete(
  '/:videoId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized');
    }

    const { videoId } = req.params;

    // Get video
    const video = await getVideoById(videoId);
    if (!video) {
      throw new AppError(404, 'Video not found');
    }

    // Verify ownership
    if (video.user_id !== req.user.userId) {
      throw new AppError(403, 'Forbidden');
    }

    // Delete video
    await deleteVideo(videoId);

    // TODO: Delete associated files from S3

    res.json({ message: 'Video deleted successfully' });
  })
);

export default router;
