import { pool } from '../db/pool';
import { v4 as uuidv4 } from 'uuid';

export interface AnalyticsEvent {
  eventId: string;
  userId: string;
  eventType: string;
  eventData: Record<string, any>;
  userAgent: string;
  ipAddress: string;
  timestamp: Date;
}

export interface UserAnalytics {
  userId: string;
  totalSessions: number;
  totalVideosUploaded: number;
  totalVideosProcessed: number;
  averageProcessingTime: number;
  averageViralScore: number;
  lastActiveAt: Date;
  createdAt: Date;
}

class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {}

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Track user event
   */
  async trackEvent(
    userId: string,
    eventType: string,
    eventData: Record<string, any>,
    userAgent: string,
    ipAddress: string
  ): Promise<AnalyticsEvent> {
    const eventId = uuidv4();

    const result = await pool.query(
      `INSERT INTO analytics_events (event_id, user_id, event_type, event_data, user_agent, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [eventId, userId, eventType, JSON.stringify(eventData), userAgent, ipAddress]
    );

    return result.rows[0];
  }

  /**
   * Track video upload
   */
  async trackVideoUpload(userId: string, videoId: string, fileSize: number): Promise<void> {
    await this.trackEvent(
      userId,
      'video_upload',
      { videoId, fileSize },
      '',
      ''
    );
  }

  /**
   * Track video processing start
   */
  async trackVideoProcessingStart(userId: string, videoId: string): Promise<void> {
    await this.trackEvent(
      userId,
      'video_processing_start',
      { videoId },
      '',
      ''
    );
  }

  /**
   * Track video processing complete
   */
  async trackVideoProcessingComplete(
    userId: string,
    videoId: string,
    processingTimeMs: number,
    viralScore: number
  ): Promise<void> {
    await this.trackEvent(
      userId,
      'video_processing_complete',
      { videoId, processingTimeMs, viralScore },
      '',
      ''
    );
  }

  /**
   * Track video download
   */
  async trackVideoDownload(userId: string, videoId: string): Promise<void> {
    await this.trackEvent(
      userId,
      'video_download',
      { videoId },
      '',
      ''
    );
  }

  /**
   * Track user login
   */
  async trackUserLogin(userId: string): Promise<void> {
    await this.trackEvent(
      userId,
      'user_login',
      { timestamp: new Date() },
      '',
      ''
    );
  }

  /**
   * Track user logout
   */
  async trackUserLogout(userId: string): Promise<void> {
    await this.trackEvent(
      userId,
      'user_logout',
      { timestamp: new Date() },
      '',
      ''
    );
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
    const result = await pool.query(
      `SELECT
        u.user_id,
        COUNT(DISTINCT CASE WHEN ae.event_type = 'user_login' THEN ae.event_id END) as total_sessions,
        COUNT(DISTINCT CASE WHEN ae.event_type = 'video_upload' THEN ae.event_id END) as total_videos_uploaded,
        COUNT(DISTINCT CASE WHEN ae.event_type = 'video_processing_complete' THEN ae.event_id END) as total_videos_processed,
        AVG(CAST(ae.event_data->>'processingTimeMs' AS FLOAT)) as avg_processing_time,
        AVG(CAST(ae.event_data->>'viralScore' AS FLOAT)) as avg_viral_score,
        MAX(ae.timestamp) as last_active_at,
        u.created_at
      FROM users u
      LEFT JOIN analytics_events ae ON u.user_id = ae.user_id
      WHERE u.user_id = $1
      GROUP BY u.user_id, u.created_at`,
      [userId]
    );

    return result.rows[0] || null;
  }

  /**
   * Get cohort analytics
   */
  async getCohortAnalytics(startDate: Date, endDate: Date): Promise<{
    newUsers: number;
    activeUsers: number;
    totalEvents: number;
    averageEventsPerUser: number;
  }> {
    const result = await pool.query(
      `SELECT
        (SELECT COUNT(*) FROM users WHERE created_at BETWEEN $1 AND $2) as new_users,
        (SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE timestamp BETWEEN $1 AND $2) as active_users,
        (SELECT COUNT(*) FROM analytics_events WHERE timestamp BETWEEN $1 AND $2) as total_events,
        (SELECT COUNT(*) FROM analytics_events WHERE timestamp BETWEEN $1 AND $2)::FLOAT / 
        NULLIF((SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE timestamp BETWEEN $1 AND $2), 0) as avg_events_per_user`,
      [startDate, endDate]
    );

    const stats = result.rows[0];

    return {
      newUsers: parseInt(stats.new_users),
      activeUsers: parseInt(stats.active_users),
      totalEvents: parseInt(stats.total_events),
      averageEventsPerUser: parseFloat(stats.avg_events_per_user) || 0,
    };
  }

  /**
   * Get funnel analytics
   */
  async getFunnelAnalytics(): Promise<{
    signups: number;
    firstUpload: number;
    firstProcessing: number;
    firstDownload: number;
    conversionRate: number;
  }> {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(DISTINCT user_id) FROM users) as signups,
        (SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE event_type = 'video_upload') as first_upload,
        (SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE event_type = 'video_processing_complete') as first_processing,
        (SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE event_type = 'video_download') as first_download
    `);

    const stats = result.rows[0];
    const signups = parseInt(stats.signups);
    const firstDownload = parseInt(stats.first_download);

    return {
      signups,
      firstUpload: parseInt(stats.first_upload),
      firstProcessing: parseInt(stats.first_processing),
      firstDownload,
      conversionRate: signups > 0 ? (firstDownload / signups) * 100 : 0,
    };
  }

  /**
   * Get retention analytics
   */
  async getRetentionAnalytics(days: number = 7): Promise<Record<string, number>> {
    const result = await pool.query(
      `SELECT
        DATE(created_at) as cohort_date,
        COUNT(DISTINCT user_id) as users
      FROM users
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY cohort_date`
    );

    const retention: Record<string, number> = {};
    result.rows.forEach((row) => {
      retention[row.cohort_date] = parseInt(row.users);
    });

    return retention;
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(startDate: Date, endDate: Date): Promise<AnalyticsEvent[]> {
    const result = await pool.query(
      `SELECT * FROM analytics_events 
       WHERE timestamp BETWEEN $1 AND $2
       ORDER BY timestamp DESC`,
      [startDate, endDate]
    );

    return result.rows;
  }
}

export const analyticsService = AnalyticsService.getInstance();
