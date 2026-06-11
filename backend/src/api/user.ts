import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { getUserById, updateUser, deleteUser } from '../db/queries/users.js';

const router = Router();

// Validation schemas
const updateUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
});

/**
 * GET /api/user/profile
 * Get user profile
 */
router.get(
  '/profile',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized');
    }

    const user = await getUserById(req.user.userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        subscriptionTier: user.subscription_tier,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  })
);

/**
 * PUT /api/user/profile
 * Update user profile
 */
router.put(
  '/profile',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized');
    }

    // Validate request body
    const validation = updateUserSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError(400, validation.error.errors[0].message);
    }

    const updatedUser = await updateUser(req.user.userId, validation.data);
    if (!updatedUser) {
      throw new AppError(404, 'User not found');
    }

    res.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        subscriptionTier: updatedUser.subscription_tier,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at,
      },
    });
  })
);

/**
 * DELETE /api/user/account
 * Delete user account
 */
router.delete(
  '/account',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized');
    }

    const deleted = await deleteUser(req.user.userId);
    if (!deleted) {
      throw new AppError(404, 'User not found');
    }

    res.json({ message: 'Account deleted successfully' });
  })
);

/**
 * GET /api/user/stats
 * Get user statistics
 */
router.get(
  '/stats',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized');
    }

    // TODO: Implement user stats (videos processed, satisfaction score, etc.)
    res.json({
      stats: {
        videosProcessed: 0,
        averageSatisfaction: 0,
        reuploadRate: 0,
        totalProcessingTime: 0,
      },
    });
  })
);

export default router;
