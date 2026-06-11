# ViralFlow AI - Testing Guide

Comprehensive testing strategy for ViralFlow AI.

## Testing Pyramid

```
         /\
        /  \        E2E Tests (10%)
       /----\
      /      \      Integration Tests (30%)
     /--------\
    /          \    Unit Tests (60%)
   /____________\
```

## Unit Testing

### Backend Unit Tests

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- auth.test.ts
```

### Test Structure

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a user with valid data', () => {
      // Arrange
      const userData = { email: 'test@example.com', password: 'Test123' };
      
      // Act
      const user = userService.createUser(userData);
      
      // Assert
      expect(user).toHaveProperty('userId');
      expect(user.email).toBe(userData.email);
    });

    it('should throw error for invalid email', () => {
      // Arrange
      const userData = { email: 'invalid', password: 'Test123' };
      
      // Act & Assert
      expect(() => userService.createUser(userData)).toThrow();
    });
  });
});
```

## Integration Testing

### Backend Integration Tests

```bash
# Run integration tests
npm run test:integration

# Run specific integration test
npm run test:integration -- auth.test.ts
```

### Test Coverage

| Module | Coverage Target |
| :--- | :--- |
| Authentication | 90%+ |
| User Management | 85%+ |
| Video Processing | 80%+ |
| Database Queries | 85%+ |
| Error Handling | 90%+ |

## End-to-End Testing

### Frontend E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode
npm run test:e2e:headed

# Run specific E2E test
npm run test:e2e -- dashboard.spec.ts
```

### E2E Test Scenarios

**Authentication Flow**
1. User navigates to signup page
2. Fills in email, username, password
3. Submits form
4. Receives confirmation
5. Redirected to login
6. Logs in with credentials
7. Redirected to dashboard

**Video Upload Flow**
1. User clicks upload button
2. Selects video file
3. Watches upload progress
4. Receives upload confirmation
5. Sees processing progress
6. Receives results notification
7. Views viral score and recommendations

**Video Processing Flow**
1. Video is uploaded to S3
2. Processing job is queued
3. AI analysis begins
4. Transcoding starts
5. Effects are applied
6. Results are stored
7. User is notified

## Performance Testing

### Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 https://api.viralflow.ai/api/monitoring/health

# Using wrk
wrk -t4 -c100 -d30s https://api.viralflow.ai/api/videos
```

### Performance Benchmarks

| Endpoint | Target P95 | Target P99 |
| :--- | :--- | :--- |
| GET /api/auth/me | <100ms | <200ms |
| POST /api/videos/upload | <500ms | <1000ms |
| GET /api/videos | <200ms | <500ms |
| GET /api/videos/:id/status | <100ms | <200ms |

## Security Testing

### OWASP Top 10

- [ ] SQL Injection - Test with malicious SQL strings
- [ ] Broken Authentication - Test password policies, session management
- [ ] Sensitive Data Exposure - Verify encryption, HTTPS
- [ ] XML External Entities - Test file uploads
- [ ] Broken Access Control - Test authorization on protected endpoints
- [ ] Security Misconfiguration - Review security headers
- [ ] Cross-Site Scripting (XSS) - Test input sanitization
- [ ] Insecure Deserialization - Test JSON parsing
- [ ] Using Components with Known Vulnerabilities - Run dependency audit
- [ ] Insufficient Logging & Monitoring - Verify logging setup

### Security Test Commands

```bash
# Check for vulnerabilities
npm audit

# Run security linter
npm run lint:security

# Test HTTPS
curl -I https://api.viralflow.ai

# Test CORS
curl -H "Origin: https://example.com" https://api.viralflow.ai/api/auth/me
```

## Database Testing

### Query Performance

```sql
-- Explain query plans
EXPLAIN ANALYZE SELECT * FROM videos WHERE user_id = $1;

-- Check index usage
SELECT schemaname, tablename, indexname FROM pg_indexes;

-- Monitor slow queries
SELECT query, mean_time FROM pg_stat_statements ORDER BY mean_time DESC;
```

### Data Integrity

```sql
-- Check constraints
SELECT constraint_name, table_name FROM information_schema.table_constraints;

-- Verify foreign keys
SELECT * FROM information_schema.referential_constraints;

-- Test transactions
BEGIN;
  INSERT INTO videos (...) VALUES (...);
  ROLLBACK;
```

## Automated Testing Pipeline

### GitHub Actions CI/CD

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v2
      
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: npm install
      
      - run: npm run lint
      
      - run: npm run test:unit
      
      - run: npm run test:integration
      
      - run: npm run test:coverage
      
      - uses: codecov/codecov-action@v2
        with:
          files: ./coverage/coverage-final.json
```

## Manual Testing Checklist

### Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Functionality Testing

- [ ] User registration works
- [ ] User login works
- [ ] Password reset works
- [ ] Video upload works
- [ ] Video processing completes
- [ ] Results display correctly
- [ ] Download works
- [ ] Feedback submission works
- [ ] User can view history
- [ ] User can delete videos

### Usability Testing

- [ ] UI is intuitive
- [ ] Error messages are clear
- [ ] Loading states are visible
- [ ] Navigation is logical
- [ ] Forms are easy to fill
- [ ] Mobile layout is responsive
- [ ] Accessibility is adequate
- [ ] Performance is acceptable

## Continuous Monitoring

### Production Monitoring

```bash
# View application logs
docker logs viralflow-backend

# Monitor system resources
docker stats viralflow-backend

# Check database health
psql -h localhost -U admin -d viralflow -c "SELECT 1"

# Monitor Redis
redis-cli INFO stats
```

### Alerting Rules

- Error rate > 5% → Alert
- Response time P95 > 1000ms → Alert
- Database CPU > 80% → Alert
- Disk usage > 90% → Alert
- Memory usage > 85% → Alert
- Queue size > 1000 jobs → Alert

## Testing Best Practices

1. **Write tests first** - Follow TDD principles
2. **Keep tests isolated** - Each test should be independent
3. **Use meaningful names** - Test names should describe what is tested
4. **Mock external dependencies** - Don't call real APIs in tests
5. **Test edge cases** - Include boundary conditions
6. **Maintain test data** - Keep test fixtures up to date
7. **Run tests frequently** - Run before every commit
8. **Measure coverage** - Aim for >80% code coverage
9. **Review test results** - Don't ignore failing tests
10. **Update tests** - Keep tests in sync with code changes

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [React Testing Library](https://testing-library.com/react)
- [Cypress Documentation](https://docs.cypress.io/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
