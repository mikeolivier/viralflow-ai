import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password.js';
import { generateTokenPair, verifyToken } from '../utils/jwt.js';
import { createUser, getUserByEmail, emailExists, getUserById } from '../db/queries/users.js';
import {
  createSession,
  getSessionByRefreshToken,
  deleteSessionByRefreshToken,
  deleteAllUserSessions,
} from '../db/queries/sessions.js';

const router = Router();

// Validation schemas
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string(),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

/**
 * POST /api/auth/signup
 * Register a new user
 */
router.post(
  '/signup',
  asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const validation = signupSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError(400, validation.error.errors[0].message);
    }

    const { email, username, password } = validation.data;

    // Check password strength
    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.isValid) {
      throw new AppError(400, `Password too weak: ${passwordCheck.errors.join(', ')}`);
    }

    // Check if email already exists
    if (await emailExists(email)) {
      throw new AppError(409, 'Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await createUser({
      email,
      username,
      password_hash: passwordHash,
    });

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      subscriptionTier: user.subscription_tier,
    });

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    await createSession(user.id, tokens.refreshToken, expiresAt);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        subscriptionTier: user.subscription_tier,
      },
      tokens,
    });
  })
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError(400, validation.error.errors[0].message);
    }

    const { email, password } = validation.data;

    // Get user by email
    const user = await getUserByEmail(email);
    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      subscriptionTier: user.subscription_tier,
    });

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    await createSession(user.id, tokens.refreshToken, expiresAt);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        subscriptionTier: user.subscription_tier,
      },
      tokens,
    });
  })
);

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post(
  '/refresh',
  asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const validation = refreshSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError(400, validation.error.errors[0].message);
    }

    const { refreshToken } = validation.data;

    // Get session
    const session = await getSessionByRefreshToken(refreshToken);
    if (!session) {
      throw new AppError(401, 'Invalid or expired refresh token');
    }

    // Get user
    const user = await getUserById(session.user_id);
    if (!user) {
      throw new AppError(401, 'User not found');
    }

    // Generate new tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      subscriptionTier: user.subscription_tier,
    });

    res.json({ tokens });
  })
);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await deleteSessionByRefreshToken(refreshToken);
    }

    res.json({ message: 'Logged out successfully' });
  })
);

/**
 * POST /api/auth/logout-all
 * Logout from all devices
 */
router.post(
  '/logout-all',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized');
    }

    await deleteAllUserSessions(req.user.userId);

    res.json({ message: 'Logged out from all devices' });
  })
);

/**
 * GET /api/auth/me
 * Get current user
 */
router.get(
  '/me',
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
      },
    });
  })
);

export default router;
