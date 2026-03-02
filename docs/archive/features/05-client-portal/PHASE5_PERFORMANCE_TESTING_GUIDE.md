# Phase 5: Performance Testing Guide

**Date**: 2025-11-14  
**Status**: ✅ COMPLETE  
**Purpose**: Performance benchmarking and optimization

## 📊 Performance Benchmarks

### API Response Times

**Target Benchmarks:**
- List endpoints: < 200ms
- Detail endpoints: < 200ms
- Create endpoints: < 500ms
- Update endpoints: < 500ms
- Delete endpoints: < 500ms
- File download: < 1000ms

### Database Query Performance

**Target Benchmarks:**
- Simple SELECT: < 50ms
- JOIN queries: < 100ms
- Aggregation: < 200ms
- Full table scan: < 500ms

### File Operations

**Target Benchmarks:**
- Signed URL generation: < 100ms
- File upload: < 2000ms
- File download: < 1000ms

## 🧪 Performance Tests

### Test 1: API Response Times

**Setup:**
```bash
# Install load testing tool
npm install -g autocannon
```

**Test:**
```bash
# Test list endpoint
autocannon -c 10 -d 30 \
  -H "Cookie: auth-token=..." \
  https://yourapp.com/api/portal/invoices

# Test detail endpoint
autocannon -c 10 -d 30 \
  -H "Cookie: auth-token=..." \
  https://yourapp.com/api/portal/invoices/[id]
```

**Metrics:**
- [ ] Average response time < 200ms
- [ ] P95 response time < 500ms
- [ ] P99 response time < 1000ms
- [ ] Error rate < 1%

### Test 2: Database Query Performance

**Setup:**
```sql
-- Enable query logging
SET log_statement = 'all';
SET log_duration = on;
```

**Test:**
```sql
-- Test simple query
EXPLAIN ANALYZE
SELECT * FROM invoices WHERE client_id = 'uuid';

-- Test JOIN query
EXPLAIN ANALYZE
SELECT i.*, p.* FROM invoices i
JOIN profiles p ON i.client_id = p.user_id
WHERE i.client_id = 'uuid';
```

**Metrics:**
- [ ] Simple query < 50ms
- [ ] JOIN query < 100ms
- [ ] No sequential scans
- [ ] Indexes used

### Test 3: Concurrent Users

**Setup:**
```bash
# Install load testing tool
npm install -g k6
```

**Test:**
```javascript
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
};

export default function () {
  let response = http.get('https://yourapp.com/api/portal/invoices', {
    headers: { 'Cookie': 'auth-token=...' },
  });
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
}
```

**Metrics:**
- [ ] 100 concurrent users supported
- [ ] Response time < 500ms at peak
- [ ] Error rate < 1%
- [ ] No timeouts

### Test 4: File Operations

**Setup:**
```bash
# Create test file
dd if=/dev/zero of=test-file.pdf bs=1M count=10
```

**Test:**
```bash
# Test file upload
time curl -X POST \
  -H "Cookie: auth-token=..." \
  -F "file=@test-file.pdf" \
  https://yourapp.com/api/admin/deliverables/upload

# Test file download
time curl -H "Cookie: auth-token=..." \
  https://yourapp.com/api/portal/deliverables/[id]/download
```

**Metrics:**
- [ ] Upload < 2000ms
- [ ] Download < 1000ms
- [ ] No memory leaks
- [ ] Proper cleanup

### Test 5: Database Connection Pooling

**Setup:**
```typescript
// Check connection pool settings
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})
```

**Test:**
```bash
# Monitor connections
SELECT count(*) FROM pg_stat_activity;

# Run concurrent requests
for i in {1..100}; do
  curl -H "Cookie: auth-token=..." \
    https://yourapp.com/api/portal/invoices &
done
```

**Metrics:**
- [ ] Connection pool size: 20
- [ ] Idle timeout: 30s
- [ ] Connection timeout: 2s
- [ ] No connection leaks

## 📈 Load Testing

### Test 1: Ramp-Up Test

**Scenario:**
- Start: 1 user
- Ramp: +10 users per minute
- Duration: 10 minutes
- Total: 100 users

**Metrics:**
- [ ] Response time stable
- [ ] No errors
- [ ] CPU < 80%
- [ ] Memory < 80%

### Test 2: Sustained Load Test

**Scenario:**
- Users: 50 concurrent
- Duration: 30 minutes
- Requests: Random endpoints

**Metrics:**
- [ ] Response time consistent
- [ ] Error rate < 1%
- [ ] No memory leaks
- [ ] No connection leaks

### Test 3: Spike Test

**Scenario:**
- Normal: 10 users
- Spike: 100 users
- Duration: 5 minutes

**Metrics:**
- [ ] Handles spike
- [ ] Response time < 1000ms
- [ ] Error rate < 5%
- [ ] Recovers quickly

### Test 4: Stress Test

**Scenario:**
- Increase users until failure
- Monitor breaking point
- Document limits

**Metrics:**
- [ ] Breaking point identified
- [ ] Graceful degradation
- [ ] Error messages clear
- [ ] Recovery possible

## 🔍 Monitoring

### Application Metrics

**Monitor:**
- [ ] Response time (avg, p95, p99)
- [ ] Error rate
- [ ] Throughput (requests/sec)
- [ ] CPU usage
- [ ] Memory usage
- [ ] Database connections

### Database Metrics

**Monitor:**
- [ ] Query time
- [ ] Slow queries
- [ ] Connection count
- [ ] Cache hit rate
- [ ] Lock contention

### Infrastructure Metrics

**Monitor:**
- [ ] CPU usage
- [ ] Memory usage
- [ ] Disk I/O
- [ ] Network I/O
- [ ] Uptime

## 📊 Performance Report Template

```
Performance Test Report
Date: [Date]
Tester: [Name]
Environment: [Dev/Staging/Prod]

Test Results:
- API Response Times: [PASS/FAIL]
  - Average: [ms]
  - P95: [ms]
  - P99: [ms]

- Database Performance: [PASS/FAIL]
  - Query time: [ms]
  - Slow queries: [count]

- Concurrent Users: [PASS/FAIL]
  - Users supported: [count]
  - Error rate: [%]

- File Operations: [PASS/FAIL]
  - Upload time: [ms]
  - Download time: [ms]

Issues Found:
1. [Issue description]
   Impact: [High/Medium/Low]
   Fix: [Recommended fix]

Recommendations:
1. [Recommendation]
2. [Recommendation]

Sign-Off: [Name] [Date]
```

## ✅ Performance Checklist

- [ ] API response times < 200ms
- [ ] Database queries < 100ms
- [ ] 100 concurrent users supported
- [ ] File operations < 2000ms
- [ ] Error rate < 1%
- [ ] No memory leaks
- [ ] No connection leaks
- [ ] CPU usage < 80%
- [ ] Memory usage < 80%
- [ ] Monitoring in place

## 🚀 Optimization Tips

1. **Database:**
   - Add indexes on frequently queried columns
   - Use connection pooling
   - Optimize slow queries

2. **API:**
   - Implement caching
   - Use pagination
   - Compress responses

3. **Frontend:**
   - Lazy load components
   - Optimize images
   - Minify assets

4. **Infrastructure:**
   - Use CDN
   - Enable compression
   - Scale horizontally

## 📞 Performance Issues

Document any performance issues:
1. Issue: [Description]
   Impact: [High/Medium/Low]
   Fix: [Recommended fix]
   Status: [Open/In Progress/Closed]

