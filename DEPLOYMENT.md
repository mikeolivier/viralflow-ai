# ViralFlow AI - Deployment Guide

This guide covers deploying ViralFlow AI to production environments.

## Prerequisites

- Docker and Docker Compose
- AWS account with S3, RDS, and SQS access
- Node.js 18+ and npm/pnpm
- PostgreSQL 14+
- Redis 6+

## Environment Setup

### 1. Backend Environment Variables

Create `.env` in the `backend/` directory:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/viralflow

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=viralflow-videos

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=24h

# Server
PORT=3001
NODE_ENV=production
LOG_LEVEL=info

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 2. Frontend Environment Variables

Create `.env.local` in the `frontend/` directory:

```bash
NEXT_PUBLIC_API_URL=https://api.viralflow.ai/api
NEXT_PUBLIC_SOCKET_URL=https://api.viralflow.ai
NEXT_PUBLIC_APP_NAME=ViralFlow AI
NEXT_PUBLIC_APP_URL=https://viralflow.ai
```

## Docker Deployment

### Build Images

```bash
# Backend
docker build -t viralflow-backend:latest ./backend

# Frontend
docker build -t viralflow-frontend:latest ./frontend
```

### Run with Docker Compose

```bash
docker-compose -f infrastructure/docker/docker-compose.yml up -d
```

## AWS Deployment

### 1. RDS Setup

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier viralflow-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password YourPassword123 \
  --allocated-storage 100
```

### 2. S3 Setup

```bash
# Create S3 bucket
aws s3 mb s3://viralflow-videos

# Set bucket policy for video uploads
aws s3api put-bucket-policy \
  --bucket viralflow-videos \
  --policy file://s3-policy.json
```

### 3. ElastiCache Setup

```bash
# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id viralflow-cache \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1
```

### 4. ECS Deployment

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name viralflow

# Register task definition
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster viralflow \
  --service-name viralflow-backend \
  --task-definition viralflow-backend:1 \
  --desired-count 2
```

## Database Migrations

```bash
# Run migrations
npm run migrate

# Seed initial data (optional)
npm run seed
```

## SSL/TLS Setup

```bash
# Using Let's Encrypt with Certbot
certbot certonly --standalone -d api.viralflow.ai -d viralflow.ai

# Update Nginx configuration
# See nginx.conf for SSL setup
```

## Monitoring & Logging

### CloudWatch

```bash
# Create log group
aws logs create-log-group --log-group-name /viralflow/backend

# Stream logs
aws logs tail /viralflow/backend --follow
```

### Application Monitoring

Access monitoring endpoints:

- Health check: `GET /api/monitoring/health`
- Metrics: `GET /api/monitoring/metrics`
- Stats: `GET /api/monitoring/stats`
- Performance: `GET /api/monitoring/performance`

## Scaling

### Horizontal Scaling

```bash
# Update ECS service desired count
aws ecs update-service \
  --cluster viralflow \
  --service viralflow-backend \
  --desired-count 5
```

### Load Balancing

```bash
# Create Application Load Balancer
aws elbv2 create-load-balancer \
  --name viralflow-alb \
  --subnets subnet-1 subnet-2 \
  --security-groups sg-xxxxx
```

## Backup & Recovery

### Database Backup

```bash
# Create RDS snapshot
aws rds create-db-snapshot \
  --db-instance-identifier viralflow-db \
  --db-snapshot-identifier viralflow-backup-$(date +%Y%m%d)
```

### S3 Backup

```bash
# Enable versioning
aws s3api put-bucket-versioning \
  --bucket viralflow-videos \
  --versioning-configuration Status=Enabled
```

## Health Checks

```bash
# Test backend
curl https://api.viralflow.ai/api/monitoring/health

# Test frontend
curl https://viralflow.ai

# Check database
psql -h your-db-host -U admin -d viralflow -c "SELECT 1"
```

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql -h $DATABASE_HOST -U $DATABASE_USER -d $DATABASE_NAME

# Check connection pool
SELECT count(*) FROM pg_stat_activity;
```

### Redis Connection Issues

```bash
# Test Redis
redis-cli -h $REDIS_HOST -p $REDIS_PORT ping

# Monitor commands
redis-cli MONITOR
```

### Video Processing Issues

```bash
# Check job queue
curl https://api.viralflow.ai/api/monitoring/metrics | jq '.metrics.queueSize'

# View processing logs
docker logs viralflow-backend | grep "processing"
```

## Performance Optimization

### Database Optimization

```sql
-- Create indexes
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_video_analysis_video_id ON video_analysis(video_id);
```

### Caching Strategy

- User profiles: 1 hour
- Video metadata: 30 minutes
- Viral scores: 24 hours
- Processing status: 5 minutes

### CDN Setup

```bash
# CloudFront distribution for frontend
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

## Security

### SSL/TLS

- Enforce HTTPS
- Use TLS 1.2+
- Certificate renewal automation

### API Security

- Rate limiting: 100 requests/minute per IP
- CORS configuration for trusted domains
- JWT token validation on all protected routes

### Database Security

- Encrypted connections (SSL)
- VPC security groups
- Automated backups
- Encryption at rest

## Rollback Procedure

```bash
# Rollback to previous version
aws ecs update-service \
  --cluster viralflow \
  --service viralflow-backend \
  --task-definition viralflow-backend:previous-version

# Wait for rollout
aws ecs wait services-stable \
  --cluster viralflow \
  --services viralflow-backend
```

## Support

For deployment issues, contact: support@viralflow.ai
