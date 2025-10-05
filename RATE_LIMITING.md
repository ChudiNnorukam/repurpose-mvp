# Rate Limiting Documentation

## Overview

Rate limiting has been implemented to prevent API abuse and protect infrastructure costs. The application uses [Upstash Redis](https://upstash.com/docs/redis) with [@upstash/ratelimit](https://github.com/upstash/ratelimit) for distributed rate limiting.

---

## Rate Limits

### **AI Operations** - `/api/adapt`
- **Limit**: 10 requests per hour per user
- **Window**: Sliding window (1 hour)
- **Reason**: Prevent OpenAI API cost abuse (each request = GPT-4 call)

### **API Operations** - `/api/schedule`
- **Limit**: 30 requests per minute per user
- **Window**: Sliding window (1 minute)
- **Reason**: Prevent QStash message quota exhaustion

---

## Configuration

### Required Environment Variables

```bash
# Get these from: https://console.upstash.com/redis
UPSTASH_REDIS_REST_URL=https://your-redis-id.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-rest-token-here
```

### Optional Configuration

**If Redis credentials are NOT configured:**
- Rate limiting will be **disabled**
- A warning will be logged: `"Rate limiting disabled: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not configured"`
- All requests will be allowed (no protection)

**This is acceptable for:**
- Local development
- Testing environments
- Low-traffic deployments

**NOT recommended for:**
- Production with multiple users
- Public-facing applications
- Cost-sensitive OpenAI usage

---

## Setup Instructions

### 1. Create Upstash Redis Database

1. Go to [Upstash Console](https://console.upstash.com/redis)
2. Click **"Create Database"**
3. Choose **"Regional"** (cheaper, sufficient for rate limiting)
4. Select region closest to your Vercel deployment
5. Click **"Create"**

### 2. Get Credentials

1. In the database dashboard, click **"REST API"** tab
2. Copy **`UPSTASH_REDIS_REST_URL`**
3. Copy **`UPSTASH_REDIS_REST_TOKEN`**

### 3. Add to Vercel Environment Variables

```bash
# Via Vercel Dashboard
# Settings → Environment Variables → Add New

UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=AX...
```

Or via CLI:
```bash
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN
```

### 4. Redeploy

```bash
git push origin main
# Or trigger manual deployment in Vercel dashboard
```

---

## How It Works

### Identifier Strategy

Rate limits are applied **per user** when authenticated:
```typescript
identifier = `user:${userId}`  // e.g., "user:123e4567-e89b-12d3-a456-426614174000"
```

For unauthenticated requests (fallback):
```typescript
identifier = `ip:${ipAddress}`  // e.g., "ip:192.168.1.1"
```

### Response Headers

When rate-limited, the API returns these headers:
```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1696435200000
Content-Type: application/json

{
  "error": "Rate limit exceeded. You can make 10 requests per hour. Try again after 3:00 PM.",
  "code": "RATE_LIMIT_EXCEEDED",
  "limit": 10,
  "remaining": 0,
  "reset": 1696435200000
}
```

### Sliding Window Algorithm

- **Not**: Fixed window (all limits reset at once)
- **Is**: Sliding window (limit resets gradually)

Example with 10 requests/hour:
```
12:00 PM - Request 1-5 ✅
12:30 PM - Request 6-10 ✅
12:31 PM - Request 11 ❌ Rate limited
1:00 PM  - Request 1-5 from 12:00 expired → 5 requests available
1:01 PM  - Request 11 ✅ (now allowed)
```

---

## Testing Rate Limits

### Local Testing (No Redis)

Rate limiting will be disabled. You'll see:
```
⚠️ [WARN] Rate limiting disabled: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not configured
```

### Production Testing

#### Test /api/adapt rate limit (10/hour):

```bash
# Make 11 requests rapidly
for i in {1..11}; do
  curl -X POST https://your-app.vercel.app/api/adapt \
    -H "Content-Type: application/json" \
    -H "Cookie: your-session-cookie" \
    -d '{
      "content": "Test content",
      "tone": "professional",
      "platforms": ["twitter"]
    }'
  echo "\nRequest $i"
done
```

Expected:
- Requests 1-10: ✅ 200 OK
- Request 11: ❌ 429 Too Many Requests

#### Test /api/schedule rate limit (30/minute):

```bash
# Make 31 requests rapidly
for i in {1..31}; do
  curl -X POST https://your-app.vercel.app/api/schedule \
    -H "Content-Type: application/json" \
    -d '{
      "platform": "twitter",
      "content": "Test",
      "scheduledTime": "2025-12-31T23:59:59Z",
      "userId": "your-user-id"
    }'
  echo "\nRequest $i"
done
```

Expected:
- Requests 1-30: ✅ 200 OK
- Request 31: ❌ 429 Too Many Requests

---

## Monitoring

### Upstash Redis Dashboard

View rate limit analytics:
1. Go to [Upstash Console](https://console.upstash.com/redis)
2. Select your database
3. Click **"Metrics"** tab
4. Monitor:
   - Total commands executed
   - Keys (rate limit identifiers)
   - Memory usage

### Application Logs

Rate limit events are logged:

```typescript
// When rate limited
logger.warn('Rate limit exceeded', {
  identifier: 'user:123',
  limit: 10,
  remaining: 0,
  reset: 1696435200000
})

// When rate limit check fails (Redis down)
logger.error('Rate limit check failed', error, {
  identifier: 'user:123'
})
// Falls back to allowing request
```

---

## Adjusting Rate Limits

### Change Limits

Edit [lib/rate-limit.ts](lib/rate-limit.ts):

```typescript
// AI operations: 10/hour → 20/hour
export const aiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 h'),  // Changed from 10
      analytics: true,
      prefix: 'ratelimit:ai',
    })
  : null

// API operations: 30/minute → 60/minute
export const apiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, '1 m'),  // Changed from 30
      analytics: true,
      prefix: 'ratelimit:api',
    })
  : null
```

### Add New Rate Limiters

```typescript
// Example: Rate limit for post execution
export const executionRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 h'),
      analytics: true,
      prefix: 'ratelimit:execution',
    })
  : null
```

Then use in route:
```typescript
import { executionRateLimiter, checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'

const identifier = getRateLimitIdentifier(request, userId)
const result = await checkRateLimit(executionRateLimiter, identifier)

if (!result.success) {
  return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
}
```

---

## Troubleshooting

### "Rate limiting disabled" warning

**Cause**: Redis credentials not configured
**Fix**: Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to environment variables

### Rate limits not working in production

**Checklist**:
1. ✅ Redis credentials added to Vercel environment variables
2. ✅ Environment variables start with `UPSTASH_REDIS_REST_` (not just `UPSTASH_`)
3. ✅ Redeployed after adding variables
4. ✅ Check Vercel logs for "Rate limiting disabled" warning
5. ✅ Verify Redis database is active in Upstash console

### Users getting rate limited too quickly

**Solutions**:
1. Increase limits in `lib/rate-limit.ts`
2. Use different identifiers (e.g., per-endpoint limits)
3. Implement tiered limits (free vs premium users)

### Redis connection errors

**Symptoms**: Logs show "Rate limit check failed"
**Impact**: Requests are **allowed** (fail-open for availability)
**Fix**:
1. Check Redis database status in Upstash console
2. Verify network connectivity
3. Check if Redis region matches Vercel region

---

## Cost Estimation

### Upstash Redis Pricing

**Free Tier** (sufficient for most use cases):
- 10,000 commands/day
- 256 MB storage
- Global replication

**Pro Tier** (if needed):
- Pay per use
- ~$0.2 per 100,000 commands
- More storage

### Example Cost Calculation

**Assumptions**:
- 100 users
- Each user adapts 5 posts/day
- Each adapt request = 2 Redis commands (limit check + set)

**Daily**:
- 100 users × 5 posts × 2 commands = 1,000 commands/day
- Well within free tier (10,000/day)

**Monthly**:
- 1,000 × 30 = 30,000 commands/month
- Cost: **$0** (free tier)

---

## Security Considerations

### IP-based Rate Limiting

**Limitation**: Shared IPs (corporate networks, VPNs) hit limits faster
**Mitigation**: Always prefer user-based rate limiting when authenticated

### Rate Limit Bypass

**Attack**: User creates multiple accounts
**Mitigation**:
1. Add email verification
2. Implement CAPTCHA on signup
3. Monitor unusual signup patterns

### DDoS Protection

**Note**: Rate limiting is NOT a complete DDoS solution
**Additional layers**:
1. Vercel's built-in DDoS protection
2. Cloudflare (if using custom domain)
3. Web Application Firewall (WAF)

---

## Future Enhancements

### Tiered Rate Limits

```typescript
// Example: Different limits for free vs premium users
function getRateLimiter(userTier: 'free' | 'premium') {
  if (userTier === 'premium') {
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 h'),  // 10x more
      prefix: 'ratelimit:ai:premium',
    })
  }
  return aiRateLimiter  // Default 10/hour
}
```

### Per-Endpoint Analytics

```typescript
// Track which endpoints hit limits most
await ratelimit.limit(identifier, {
  analytics: {
    endpoint: '/api/adapt',
    userId: user.id,
  }
})
```

### Dynamic Rate Limits

```typescript
// Adjust limits based on OpenAI API costs or usage
const currentHourUsage = await getOpenAICosts()
const limit = currentHourUsage > 100 ? 5 : 10
```

---

**Rate limiting is now active and protecting your API!** 🛡️
