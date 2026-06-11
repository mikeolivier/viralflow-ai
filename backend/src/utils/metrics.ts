import { logger } from './logger';

export interface Metrics {
  videosProcessed: number;
  videosProcessedTotal: number;
  averageProcessingTime: number;
  successRate: number;
  errorRate: number;
  activeUsers: number;
  queueSize: number;
  averageViralScore: number;
  requestsPerSecond: number;
  errorCount: number;
  warningCount: number;
}

class MetricsService {
  private static instance: MetricsService;
  private metrics: Metrics = {
    videosProcessed: 0,
    videosProcessedTotal: 0,
    averageProcessingTime: 0,
    successRate: 0,
    errorRate: 0,
    activeUsers: 0,
    queueSize: 0,
    averageViralScore: 0,
    requestsPerSecond: 0,
    errorCount: 0,
    warningCount: 0,
  };

  private processingTimes: number[] = [];
  private viralScores: number[] = [];
  private requestTimestamps: number[] = [];

  private constructor() {
    this.initializeMetricsCollection();
  }

  static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  private initializeMetricsCollection() {
    // Calculate RPS every second
    setInterval(() => {
      const now = Date.now();
      const oneSecondAgo = now - 1000;

      this.requestTimestamps = this.requestTimestamps.filter(
        (ts) => ts > oneSecondAgo
      );
      this.metrics.requestsPerSecond = this.requestTimestamps.length;
    }, 1000);

    // Log metrics every minute
    setInterval(() => {
      this.logMetrics();
    }, 60000);
  }

  recordRequest() {
    this.requestTimestamps.push(Date.now());
  }

  recordVideoProcessed(processingTimeMs: number, viralScore: number) {
    this.metrics.videosProcessed++;
    this.metrics.videosProcessedTotal++;
    this.processingTimes.push(processingTimeMs);
    this.viralScores.push(viralScore);

    // Keep only last 1000 samples
    if (this.processingTimes.length > 1000) {
      this.processingTimes.shift();
    }
    if (this.viralScores.length > 1000) {
      this.viralScores.shift();
    }

    this.updateAverages();
  }

  recordError() {
    this.metrics.errorCount++;
    this.updateSuccessRate();
  }

  recordWarning() {
    this.metrics.warningCount++;
  }

  setActiveUsers(count: number) {
    this.metrics.activeUsers = count;
  }

  setQueueSize(size: number) {
    this.metrics.queueSize = size;
  }

  private updateAverages() {
    if (this.processingTimes.length > 0) {
      this.metrics.averageProcessingTime =
        this.processingTimes.reduce((a, b) => a + b, 0) /
        this.processingTimes.length;
    }

    if (this.viralScores.length > 0) {
      this.metrics.averageViralScore =
        this.viralScores.reduce((a, b) => a + b, 0) / this.viralScores.length;
    }
  }

  private updateSuccessRate() {
    const total = this.metrics.videosProcessedTotal;
    if (total > 0) {
      this.metrics.successRate =
        ((total - this.metrics.errorCount) / total) * 100;
      this.metrics.errorRate = (this.metrics.errorCount / total) * 100;
    }
  }

  getMetrics(): Metrics {
    return { ...this.metrics };
  }

  resetMetrics() {
    this.metrics = {
      videosProcessed: 0,
      videosProcessedTotal: 0,
      averageProcessingTime: 0,
      successRate: 0,
      errorRate: 0,
      activeUsers: 0,
      queueSize: 0,
      averageViralScore: 0,
      requestsPerSecond: 0,
      errorCount: 0,
      warningCount: 0,
    };
    this.processingTimes = [];
    this.viralScores = [];
  }

  private logMetrics() {
    logger.info(`Metrics Report: ${JSON.stringify(this.getMetrics())}`);
  }
}

export const metricsService = MetricsService.getInstance();
