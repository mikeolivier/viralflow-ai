import { Router, Request, Response } from 'express';
import { metricsService } from '../utils/metrics';
import { cacheService } from '../utils/cache';
import { pool } from '../db/pool';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

/**
 * GET /api/monitoring/health
 * Health check endpoint
 */
router.get(
  '/health',
  asyncHandler(async (req: Request, res: Response) => {
    const checks = {
      database: false,
      cache: false,
      timestamp: new Date().toISOString(),
    };

    try {
      // Check database
      await pool.query('SELECT 1');
      checks.database = true;
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    try {
      // Check cache
      await cacheService.set('health-check', { ok: true }, { ttl: 10 });
      const cached = await cacheService.get('health-check');
      checks.cache = cached !== null;
    } catch (error) {
      console.error('Cache health check failed:', error);
    }

    const allHealthy = checks.database && checks.cache;
    const statusCode = allHealthy ? 200 : 503;

    res.status(statusCode).json({
      status: allHealthy ? 'healthy' : 'degraded',
      checks,
    });
  })
);

/**
 * GET /api/monitoring/metrics
 * Get current metrics
 */
router.get(
  '/metrics',
  asyncHandler(async (req: Request, res: Response) => {
    const metrics = metricsService.getMetrics();

    res.json({
      metrics,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * GET /api/monitoring/stats
 * Get application statistics
 */
router.get(
  '/stats',
  asyncHandler(async (req: Request, res: Response) => {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM videos) as total_videos,
        (SELECT COUNT(*) FROM videos WHERE status = 'completed') as completed_videos,
        (SELECT COUNT(*) FROM videos WHERE status = 'processing') as processing_videos,
        (SELECT COUNT(*) FROM videos WHERE status = 'failed') as failed_videos,
        (SELECT AVG(viral_score) FROM video_analysis) as avg_viral_score,
        (SELECT AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) 
         FROM videos WHERE completed_at IS NOT NULL) as avg_processing_time_seconds
    `);

    const stats = result.rows[0];

    res.json({
      stats: {
        totalUsers: parseInt(stats.total_users),
        totalVideos: parseInt(stats.total_videos),
        completedVideos: parseInt(stats.completed_videos),
        processingVideos: parseInt(stats.processing_videos),
        failedVideos: parseInt(stats.failed_videos),
        averageViralScore: parseFloat(stats.avg_viral_score) || 0,
        averageProcessingTimeSeconds:
          parseFloat(stats.avg_processing_time_seconds) || 0,
      },
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * GET /api/monitoring/performance
 * Get performance metrics
 */
router.get(
  '/performance',
  asyncHandler(async (req: Request, res: Response) => {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    res.json({
      performance: {
        uptime: Math.floor(uptime),
        memory: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system,
        },
      },
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * POST /api/monitoring/reset-metrics
 * Reset metrics (admin only)
 */
router.post(
  '/reset-metrics',
  asyncHandler(async (req: Request, res: Response) => {
    // In production, add admin authentication check here
    metricsService.resetMetrics();

    res.json({
      message: 'Metrics reset successfully',
    });
  })
);

export default router;
