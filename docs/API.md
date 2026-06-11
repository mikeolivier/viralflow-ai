# ViralFlow AI - API Documentation

## Overview

ViralFlow AI API is a RESTful service for managing video uploads, processing, and user authentication. All responses are in JSON format.

**Base URL:** `http://localhost:3001/api`  
**API Version:** 1.0.0

---

## Authentication

All protected endpoints require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

### Token Expiration

- **Access Token:** 1 hour
- **Refresh Token:** 7 days

---

## Error Handling

All error responses follow this format:

```json
{
  "error": {
    "status": 400,
    "message": "Error description",
    "timestamp": "2026-06-06T12:00:00.000Z"
  }
}
```

### Common Status Codes

| Code | Meaning |
| :--- | :--- |
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

---

## Authentication Endpoints

### POST /auth/signup

Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "SecurePassword123!"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*)

**Response (201):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "username",
    "subscriptionTier": "free"
  },
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

---

### POST /auth/login

Authenticate user and receive tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "username",
    "subscriptionTier": "free"
  },
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

---

### POST /auth/refresh

Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200):**
```json
{
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

---

### POST /auth/logout

Logout user and invalidate refresh token.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### POST /auth/logout-all

Logout from all devices by invalidating all sessions.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "message": "Logged out from all devices"
}
```

---

### GET /auth/me

Get current authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "username",
    "subscriptionTier": "free",
    "createdAt": "2026-06-06T12:00:00.000Z"
  }
}
```

---

## User Endpoints

### GET /user/profile

Get user profile information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "username",
    "subscriptionTier": "free",
    "createdAt": "2026-06-06T12:00:00.000Z",
    "updatedAt": "2026-06-06T12:00:00.000Z"
  }
}
```

---

### PUT /user/profile

Update user profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "username": "newusername"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "newusername",
    "subscriptionTier": "free",
    "createdAt": "2026-06-06T12:00:00.000Z",
    "updatedAt": "2026-06-06T12:00:00.000Z"
  }
}
```

---

### DELETE /user/account

Delete user account (soft delete).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "message": "Account deleted successfully"
}
```

---

### GET /user/stats

Get user statistics.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "stats": {
    "videosProcessed": 42,
    "averageSatisfaction": 4.5,
    "reuploadRate": 0.65,
    "totalProcessingTime": 3600
  }
}
```

---

## Video Endpoints (Coming Soon)

### POST /videos/upload
Upload a video for processing.

### GET /videos/:videoId/status
Get video processing status.

### GET /videos/:videoId/result
Get processed video result.

### GET /videos
List user's videos.

### DELETE /videos/:videoId
Delete a video.

---

## Rate Limiting

API requests are rate limited to **100 requests per 15 minutes** per IP address.

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1623000000
```

When rate limit is exceeded, you'll receive a 429 (Too Many Requests) response.

---

## Pagination

List endpoints support pagination with query parameters:

```
GET /videos?page=1&limit=20
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## Real-time Updates (WebSocket)

Connect to WebSocket for real-time video processing updates:

```javascript
const socket = io('http://localhost:3001', {
  auth: {
    token: accessToken
  }
});

// Subscribe to video progress
socket.emit('subscribe-video-progress', videoId);

// Listen for updates
socket.on('video-progress', (data) => {
  console.log('Processing progress:', data);
});
```

---

## Example Requests

### Sign Up
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "username",
    "password": "SecurePassword123!"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:3001/api/user/profile \
  -H "Authorization: Bearer <access_token>"
```

---

## Changelog

### v1.0.0 (June 6, 2026)
- Initial API release
- Authentication endpoints
- User management endpoints
- Real-time WebSocket support
