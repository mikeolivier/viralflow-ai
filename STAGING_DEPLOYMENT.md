# ViralFlow AI - Staging Environment Setup

## Overview

The staging environment mirrors production and is used for testing, beta deployment, and final validation before public launch.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Staging Environment                  │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────┐         ┌──────────────────┐      │
│  │   Frontend       │         │   Backend API    │      │
│  │  (Next.js)       │◄───────►│  (Express)       │      │
│  │  staging.        │         │  api-staging.    │      │
│  │  viralflow.ai    │         │  viralflow.ai    │      │
│  └──────────────────┘         └──────────────────┘      │
│           │                            │                 │
│           │                            ▼                 │
│           │                    ┌──────────────────┐      │
│           │                    │   PostgreSQL     │      │
│           │                    │   (Staging DB)   │      │
│           │                    └──────────────────┘      │
│           │                            │                 │
│           ▼                            ▼                 │
│  ┌──────────────────────────────────────────────┐       │
│  │         AWS S3 (Staging Bucket)              │       │
│  │     viralflow-staging-videos                 │       │
│  └──────────────────────────────────────────────┘       │
│                                                           │
│  ┌──────────────────────────────────────────────┐       │
│  │         Redis Cache (Staging)                │       │
│  │     redis-staging.viralflow.ai               │       │
│  └──────────────────────────────────────────────┘       │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Prerequisites

- AWS account with staging credentials
- Docker and Docker Compose
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

## Environment Variables

### Backend Staging (.env.staging)

```bash
# Database
DATABASE_URL=postgresql://staging_user:staging_pass@staging-db.viralflow.ai:5432/viralflow_staging

# Redis
REDIS_HOST=redis-staging.viralflow.ai
REDIS_PORT=6379

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=staging_access_key
AWS_SECRET_ACCESS_KEY=staging_secret_key
AWS_S3_BUCKET=viralflow-staging-videos

# JWT
JWT_SECRET=staging_jwt_secret_key
JWT_EXPIRATION=24h

# Server
PORT=3001
NODE_ENV=staging
LOG_LEVEL=debug

# Beta Program
BETA_ENABLED=true
BETA_INVITE_EXPIRATION_DAYS=30

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=staging@viralflow.ai
SMTP_PASS=staging_app_password
```

### Frontend Staging (.env.staging)

```bash
NEXT_PUBLIC_API_URL=https://api-staging.viralflow.ai/api
NEXT_PUBLIC_SOCKET_URL=https://api-staging.viralflow.ai
NEXT_PUBLIC_APP_NAME=ViralFlow AI (Staging)
NEXT_PUBLIC_APP_URL=https://staging.viralflow.ai
NEXT_PUBLIC_ENVIRONMENT=staging
```

## Deployment Steps

### 1. Build Docker Images

```bash
# Backend
docker build -t viralflow-backend:staging -f backend/Dockerfile.staging ./backend

# Frontend
docker build -t viralflow-frontend:staging -f frontend/Dockerfile.staging ./frontend
```

### 2. Push to Container Registry

```bash
# AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

docker tag viralflow-backend:staging 123456789.dkr.ecr.us-east-1.amazonaws.com/viralflow-backend:staging
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/viralflow-backend:staging

docker tag viralflow-frontend:staging 123456789.dkr.ecr.us-east-1.amazonaws.com/viralflow-frontend:staging
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/viralflow-frontend:staging
```

### 3. Deploy to ECS

```bash
# Update ECS task definitions
aws ecs register-task-definition \
  --cli-input-json file://ecs-task-definition-staging.json

# Update ECS service
aws ecs update-service \
  --cluster viralflow-staging \
  --service viralflow-backend-staging \
  --task-definition viralflow-backend-staging:latest \
  --force-new-deployment

# Wait for deployment
aws ecs wait services-stable \
  --cluster viralflow-staging \
  --services viralflow-backend-staging
```

### 4. Run Database Migrations

```bash
# Connect to staging database
psql -h staging-db.viralflow.ai -U staging_user -d viralflow_staging

# Run migrations
npm run migrate:staging

# Seed beta data
npm run seed:staging
```

### 5. Verify Deployment

```bash
# Health check
curl https://api-staging.viralflow.ai/api/monitoring/health

# Check logs
aws logs tail /viralflow/staging/backend --follow

# Test API
curl -X POST https://api-staging.viralflow.ai/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@staging.viralflow.ai",
    "username": "stagingtest",
    "password": "TestPassword123"
  }'
```

## Beta User Management

### Create Beta Invites

```bash
# Connect to backend container
docker exec -it viralflow-backend-staging npm run cli

# Create invites
> createBetaInvites(['user1@example.com', 'user2@example.com'], 'early-access')
```

### Monitor Beta Metrics

```bash
# Get beta statistics
curl https://api-staging.viralflow.ai/api/beta/statistics \
  -H "Authorization: Bearer $TOKEN"

# Get feedback
curl https://api-staging.viralflow.ai/api/monitoring/stats \
  -H "Authorization: Bearer $TOKEN"
```

## Testing Checklist

### Functional Testing
- [ ] User registration works
- [ ] User login works
- [ ] Video upload works
- [ ] Video processing completes
- [ ] Results display correctly
- [ ] Feedback submission works
- [ ] Beta invite system works
- [ ] Analytics tracking works

### Performance Testing
- [ ] API response time < 200ms (P95)
- [ ] Video processing < 5 minutes
- [ ] Database queries < 100ms
- [ ] Frontend Lighthouse score > 90

### Security Testing
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] SQL injection protection
- [ ] XSS protection
- [ ] CSRF tokens valid

### Load Testing
- [ ] 100 concurrent users
- [ ] 10 videos processing simultaneously
- [ ] Database connection pool stable
- [ ] No memory leaks

## Monitoring & Alerting

### CloudWatch Dashboards

```bash
# Create dashboard
aws cloudwatch put-dashboard \
  --dashboard-name viralflow-staging \
  --dashboard-body file://cloudwatch-dashboard-staging.json
```

### Alert Rules

| Metric | Threshold | Action |
| :--- | :--- | :--- |
| Error Rate | > 5% | Page on-call |
| Response Time P95 | > 1000ms | Investigate |
| Database CPU | > 80% | Scale up |
| Disk Usage | > 90% | Alert |
| Memory Usage | > 85% | Alert |

## Rollback Procedure

### If Deployment Fails

```bash
# Rollback to previous version
aws ecs update-service \
  --cluster viralflow-staging \
  --service viralflow-backend-staging \
  --task-definition viralflow-backend-staging:previous \
  --force-new-deployment

# Verify rollback
aws ecs describe-services \
  --cluster viralflow-staging \
  --services viralflow-backend-staging
```

## Data Management

### Backup Staging Database

```bash
# Create snapshot
aws rds create-db-snapshot \
  --db-instance-identifier viralflow-staging-db \
  --db-snapshot-identifier viralflow-staging-backup-$(date +%Y%m%d)

# List snapshots
aws rds describe-db-snapshots --db-instance-identifier viralflow-staging-db
```

### Clear Staging Data

```bash
# Connect to database
psql -h staging-db.viralflow.ai -U staging_user -d viralflow_staging

# Clear all data
TRUNCATE users CASCADE;
TRUNCATE videos CASCADE;
TRUNCATE analytics_events CASCADE;
```

## Troubleshooting

### Backend Not Starting

```bash
# Check logs
docker logs viralflow-backend-staging

# Check database connection
psql -h staging-db.viralflow.ai -U staging_user -d viralflow_staging -c "SELECT 1"

# Check Redis connection
redis-cli -h redis-staging.viralflow.ai ping
```

### Video Processing Failing

```bash
# Check job queue
curl https://api-staging.viralflow.ai/api/monitoring/metrics | jq '.metrics.queueSize'

# Check FFmpeg
docker exec viralflow-backend-staging ffmpeg -version

# Check S3 access
aws s3 ls s3://viralflow-staging-videos/
```

### High Database Load

```bash
# Check slow queries
psql -h staging-db.viralflow.ai -U staging_user -d viralflow_staging -c "SELECT query, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Kill long-running queries
psql -h staging-db.viralflow.ai -U staging_user -d viralflow_staging -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE duration > interval '5 minutes';"
```

## Maintenance

### Weekly Tasks
- [ ] Review error logs
- [ ] Check disk usage
- [ ] Monitor database size
- [ ] Backup database
- [ ] Review beta feedback

### Monthly Tasks
- [ ] Update dependencies
- [ ] Run security scan
- [ ] Analyze performance trends
- [ ] Plan capacity upgrades
- [ ] Review cost optimization

## Support

- **Staging Admin:** [Name]
- **Email:** staging-admin@viralflow.ai
- **Slack:** #staging-deployment
- **On-Call:** [Schedule]

---

**Last Updated:** [Date]
**Next Review:** [Date]
