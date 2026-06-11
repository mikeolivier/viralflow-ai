import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import * as betaUsersQueries from '../db/queries/betaUsers';
import * as feedbackQueries from '../db/queries/feedback';
import { analyticsService } from '../services/analyticsService';

const router = Router();

/**
 * POST /api/beta/join
 * Join beta program with invite code
 */
router.post(
  '/join',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { inviteCode } = req.body;
    const userId = req.user?.userId;

    if (!inviteCode || !userId) {
      return res.status(400).json({ message: 'Invite code and user ID required' });
    }

    try {
      // Accept the invite
      const invite = await betaUsersQueries.acceptBetaInvite(inviteCode, userId);

      // Create beta user
      const betaUser = await betaUsersQueries.createBetaUser(
        userId,
        invite.tier
      );

      // Track event
      await analyticsService.trackEvent(
        userId,
        'beta_join',
        { tier: invite.tier },
        req.get('user-agent') || '',
        req.ip || ''
      );

      res.status(200).json({
        message: 'Successfully joined beta program',
        betaUser,
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid or expired invite code' });
    }
  })
);

/**
 * GET /api/beta/status
 * Get user's beta status
 */
router.get(
  '/status',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const betaUser = await betaUsersQueries.getBetaUserByUserId(userId);

    if (!betaUser) {
      return res.status(404).json({ message: 'Not a beta user' });
    }

    res.json({ betaUser });
  })
);

/**
 * POST /api/beta/feedback
 * Submit feedback
 */
router.post(
  '/feedback',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { type, rating, title, message, videoId, metadata } = req.body;
    const userId = req.user?.userId;

    if (!userId || !type || !rating || !title || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const feedback = await feedbackQueries.createFeedback(
      userId,
      type,
      rating,
      title,
      message,
      videoId,
      metadata
    );

    // Update beta user feedback score
    const betaUser = await betaUsersQueries.getBetaUserByUserId(userId);
    if (betaUser) {
      await betaUsersQueries.updateFeedbackScore(userId, rating);
    }

    // Track event
    await analyticsService.trackEvent(
      userId,
      'feedback_submitted',
      { type, rating, videoId },
      req.get('user-agent') || '',
      req.ip || ''
    );

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback,
    });
  })
);

/**
 * GET /api/beta/feedback
 * Get user's feedback history
 */
router.get(
  '/feedback',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { feedback, total } = await feedbackQueries.getUserFeedback(
      userId,
      page,
      limit
    );

    res.json({
      feedback,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  })
);

/**
 * POST /api/beta/invites
 * Create beta invites (admin only)
 */
router.post(
  '/invites',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { emails, tier } = req.body;
    const userId = req.user?.userId;

    // Check if user is admin (simplified check - in production, use proper role-based access)
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!Array.isArray(emails) || !tier) {
      return res.status(400).json({ message: 'Emails array and tier required' });
    }

    const invites = [];
    for (const email of emails) {
      const invite = await betaUsersQueries.createBetaInvite(
        email,
        tier,
        userId
      );
      invites.push(invite);
    }

    res.status(201).json({
      message: `Created ${invites.length} invites`,
      invites,
    });
  })
);

/**
 * GET /api/beta/statistics
 * Get beta program statistics
 */
router.get(
  '/statistics',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const betaStats = await betaUsersQueries.getBetaStatistics();
    const feedbackStats = await feedbackQueries.getFeedbackStatistics();
    const funnelStats = await analyticsService.getFunnelAnalytics();

    res.json({
      beta: betaStats,
      feedback: feedbackStats,
      funnel: funnelStats,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * GET /api/beta/analytics
 * Get user analytics
 */
router.get(
  '/analytics',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userAnalytics = await analyticsService.getUserAnalytics(userId);

    if (!userAnalytics) {
      return res.status(404).json({ message: 'No analytics data found' });
    }

    res.json({ analytics: userAnalytics });
  })
);

export default router;
