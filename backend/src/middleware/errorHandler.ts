import { Request, Response, NextFunction } from 'express';
import pino from 'pino';

const logger = pino();

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Global error handling middleware
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error({
    error: err,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        status: err.statusCode,
        message: err.message,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    res.status(400).json({
      error: {
        status: 400,
        message: 'Validation error',
        details: err.message,
      },
    });
    return;
  }

  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      error: {
        status: 401,
        message: 'Unauthorized',
      },
    });
    return;
  }

  // Default error response
  res.status(500).json({
    error: {
      status: 500,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Async error wrapper to catch errors in async route handlers
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
