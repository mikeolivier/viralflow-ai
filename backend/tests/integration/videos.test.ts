import request from 'supertest';
import { app } from '../../src/index';
import { pool } from '../../src/db/pool';

describe('Video Processing Integration Tests', () => {
  let authToken: string;
  let userId: string;
  const testUser = {
    email: 'video-test@example.com',
    username: 'videotester',
    password: 'TestPassword123',
  };

  beforeAll(async () => {
    // Cleanup
    await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);

    // Create test user
    const signupResponse = await request(app)
      .post('/api/auth/signup')
      .send(testUser);

    authToken = signupResponse.body.auth.accessToken;
    userId = signupResponse.body.user.userId;
  });

  afterAll(async () => {
    // Cleanup
    await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
    await pool.end();
  });

  describe('POST /api/videos/upload', () => {
    it('should generate presigned URL for video upload', async () => {
      const response = await request(app)
        .post('/api/videos/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          filename: 'test-video.mp4',
          fileSize: 50 * 1024 * 1024, // 50MB
        })
        .expect(200);

      expect(response.body).toHaveProperty('upload');
      expect(response.body).toHaveProperty('video');
      expect(response.body.upload).toHaveProperty('url');
      expect(response.body.video).toHaveProperty('id');
      expect(response.body.video.status).toBe('pending');
    });

    it('should reject upload without authentication', async () => {
      await request(app)
        .post('/api/videos/upload')
        .send({
          filename: 'test-video.mp4',
          fileSize: 50 * 1024 * 1024,
        })
        .expect(401);
    });

    it('should reject oversized files', async () => {
      const response = await request(app)
        .post('/api/videos/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          filename: 'huge-video.mp4',
          fileSize: 600 * 1024 * 1024, // 600MB (exceeds 500MB limit)
        })
        .expect(400);

      expect(response.body.message).toContain('size');
    });
  });

  describe('GET /api/videos/:videoId/status', () => {
    let videoId: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/videos/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          filename: 'status-test.mp4',
          fileSize: 30 * 1024 * 1024,
        });

      videoId = response.body.video.id;
    });

    it('should return video processing status', async () => {
      const response = await request(app)
        .get(`/api/videos/${videoId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('video');
      expect(response.body.video).toHaveProperty('status');
      expect(['pending', 'processing', 'completed', 'failed']).toContain(
        response.body.video.status
      );
    });

    it('should reject unauthorized access', async () => {
      await request(app)
        .get(`/api/videos/${videoId}/status`)
        .expect(401);
    });

    it('should return 404 for non-existent video', async () => {
      await request(app)
        .get('/api/videos/nonexistent-id/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /api/videos', () => {
    it('should list user videos with pagination', async () => {
      const response = await request(app)
        .get('/api/videos?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('videos');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.videos)).toBe(true);
    });

    it('should reject request without authentication', async () => {
      await request(app).get('/api/videos').expect(401);
    });
  });

  describe('DELETE /api/videos/:videoId', () => {
    let videoId: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/videos/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          filename: 'delete-test.mp4',
          fileSize: 30 * 1024 * 1024,
        });

      videoId = response.body.video.id;
    });

    it('should delete video', async () => {
      const response = await request(app)
        .delete(`/api/videos/${videoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toContain('deleted');
    });

    it('should return 404 when deleting non-existent video', async () => {
      await request(app)
        .delete('/api/videos/nonexistent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
