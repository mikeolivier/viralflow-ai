import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import pinoHttp from 'pino-http';
import pino from 'pino';

// Load environment variables
dotenv.config();

// Initialize logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

// Import database
import { closePool } from './db/pool.js';

// Import routes
import authRoutes from './api/auth.js';
import userRoutes from './api/user.js';
import videoRoutes from './api/videos.js';
import feedbackRoutes from './api/feedback.js';

// Import video processing
import { setupVideoProcessingWorker, cleanupVideoProcessingWorker } from './services/videoProcessingWorker.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';

// Create Express app
const app: Express = express();
const server = http.createServer(app);

// Initialize Socket.IO for real-time updates
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  message: 'Too many requests from this IP, please try again later.',
});

app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(pinoHttp({ logger }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/feedback', feedbackRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });

  // Video processing progress updates
  socket.on('subscribe-video-progress', (videoId: string) => {
    socket.join(`video-${videoId}`);
    logger.info(`Client subscribed to video progress: ${videoId}`);
  });

  socket.on('unsubscribe-video-progress', (videoId: string) => {
    socket.leave(`video-${videoId}`);
    logger.info(`Client unsubscribed from video progress: ${videoId}`);
  });
});



// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      status: 404,
      message: 'Not Found',
      path: req.path,
    },
  });
});

// Start server
const PORT = parseInt(process.env.PORT || '3001', 10);

server.listen(PORT, '0.0.0.0', async () => {
  logger.info(`🚀 ViralFlow AI Backend running on http://localhost:${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
  logger.info(`🔌 Socket.IO ready for real-time updates`);
  logger.info(`📝 API Documentation: http://localhost:${PORT}/api/docs`);
  
  // Setup video processing worker
  try {
    await setupVideoProcessingWorker();
    logger.info(`🎬 Video processing worker initialized`);
  } catch (error) {
    logger.error(`Failed to setup video processing worker: ${error}`);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  server.close(async () => {
    await cleanupVideoProcessingWorker();
    await closePool();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  server.close(async () => {
    await cleanupVideoProcessingWorker();
    await closePool();
    process.exit(0);
  });
});

export { io, setupVideoProcessingWorker };
export default app;
