import { Request, Response, NextFunction } from 'express';
import { extractTokenFromHeader, verifyToken, JWTPayload } from '../utils/jwt.js';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Authentication middleware - verifies JWT token
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        error: {
          status: 401,
          message: 'Missing authorization token',
        },
      });
      return;
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      error: {
        status: 401,
        message: error instanceof Error ? error.message : 'Authentication failed',
      },
    });
  }
}

/**
 * Optional authentication middleware - doesn't fail if token is missing
 */
export function optionalAuthenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
    }
  } catch (error) {
    // Silently fail for optional auth
  }

  next();
}

/**
 * Check if user has specific subscription tier
 */
export function requireSubscription(tier: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: {
          status: 401,
          message: 'Authentication required',
        },
      });
      return;
    }

    const tiers = ['free', 'pro', 'agency'];
    const requiredTierIndex = tiers.indexOf(tier);
    const userTierIndex = tiers.indexOf(req.user.subscriptionTier);

    if (userTierIndex < requiredTierIndex) {
      res.status(403).json({
        error: {
          status: 403,
          message: `${tier} subscription required`,
        },
      });
      return;
    }

    next();
  };
}
