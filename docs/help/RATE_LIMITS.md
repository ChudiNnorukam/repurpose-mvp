# Rate Limits Guide

Understanding rate limits is crucial for successful social media automation. This guide explains limits for each platform and how to work within them.

## What Are Rate Limits?

Rate limits are restrictions that social media platforms place on how often you can perform actions like posting, liking, or following. They exist to:
- Prevent spam and abuse
- Ensure fair usage across all users
- Maintain platform performance
- Protect against automated bot activity

## Twitter (X) Rate Limits

### Posting Limits

| User Type | Posts per Day | Posts per Hour |
|-----------|---------------|----------------|
| Basic | 50 | Not specified |
| Verified | 100 | Not specified |
| Premium | 200 | Not specified |

### API Limits (Repurpose AI)

| Endpoint | Limit | Window |
|----------|-------|--------|
| Create Tweet | 50 requests | 24 hours |
| Read User | 300 requests | 15 minutes |
| Media Upload | 50 requests | 15 minutes |

### Best Practices

✅ **Do:**
- Space tweets 30+ minutes apart
- Schedule posts during high-engagement hours (8 AM - 4 PM)
- Use scheduling to distribute posts evenly
- Monitor your daily post count

❌ **Don't:**
- Post identical content multiple times
- Schedule 50 posts within a few hours
- Use automated replies excessively
- Post during off-hours (midnight-6 AM)

### What Happens When You Hit the Limit

**Symptoms:**
- Error message: "Rate limit exceeded"
- Posts fail to publish
- 429 HTTP status code

**Recovery:**
- Wait 24 hours for daily limit reset
- System automatically retries after reset
- Check Posts tab for retry status

**Prevention:**
- Use the scheduling feature strategically
- Monitor your posting frequency in dashboard
- Set reminders for rate limit awareness

---

## LinkedIn Rate Limits

### Posting Limits

| Action | Limit | Time Window |
|--------|-------|-------------|
| Posts | 100 | 24 hours |
| Comments | 200 | 24 hours |
| Reactions | 1000 | 24 hours |

### API Limits (Repurpose AI)

| Endpoint | Limit | Window |
|----------|-------|--------|
| UGC Posts | 100 requests | 24 hours |
| Profile Read | 500 requests | 24 hours |
| Media Upload | 100 requests | 24 hours |

### Best Practices

✅ **Do:**
- Post during business hours (7 AM - 7 PM)
- Focus on quality over quantity
- Engage with your posts (replies, comments)
- Use scheduling for consistent presence

❌ **Don't:**
- Batch-post 20+ posts in one session
- Post duplicate content across profiles
- Ignore engagement on your posts
- Post irrelevant or spammy content

### What Happens When You Hit the Limit

**Symptoms:**
- Error message: "Daily limit reached"
- API returns 429 status
- Posts queued until limit resets

**Recovery:**
- Limits reset at midnight UTC
- System retries automatically
- View retry schedule in Posts tab

**Prevention:**
- LinkedIn is generous - focus on content quality
- Spread posts throughout the week
- Use analytics to identify best posting times

---

## Instagram Rate Limits

**Note:** Instagram integration coming soon.

### Expected Limits

| Action | Estimated Limit | Window |
|--------|----------------|--------|
| Posts | 50 | 24 hours |
| Stories | 100 | 24 hours |
| Comments | 180 | 1 hour |

### Planned Best Practices

- Focus on visual content quality
- Post 1-3 times per day maximum
- Use Instagram scheduling strategically
- Avoid rapid-fire posting

---

## General Guidelines

### Understanding Rate Limit Windows

**Rolling Windows:**
- Twitter uses 15-minute rolling windows for API calls
- Each request "expires" 15 minutes after it's made
- Example: Post at 2:00 PM, slot frees at 2:15 PM

**Daily Windows:**
- LinkedIn uses 24-hour windows (midnight-midnight UTC)
- All limits reset at the same time
- Plan accordingly for UTC time zone

### Rate Limit Headers

When you hit a limit, the system provides info:
```
X-Rate-Limit-Limit: 50
X-Rate-Limit-Remaining: 0
X-Rate-Limit-Reset: 1697486400
```

- **Limit:** Maximum requests allowed
- **Remaining:** How many requests you have left
- **Reset:** Unix timestamp when limit resets

### Auto-Retry System

Repurpose AI automatically handles rate limits:

1. **Detection:** System detects rate limit error
2. **Calculation:** Determines when limit resets
3. **Scheduling:** Queues post for retry after reset
4. **Notification:** Updates post status to "Retrying"
5. **Retry:** Attempts to post again automatically
6. **Success/Failure:** Updates final status

**Retry Schedule:**
- Attempt 1: Immediate
- Attempt 2: After 2 minutes
- Attempt 3: After 4 minutes
- Attempt 4: After 8 minutes
- Attempt 5: After 16 minutes
- Max retries: 5

---

## Monitoring Your Usage

### Dashboard Metrics

View your rate limit usage:
1. Go to **Dashboard**
2. Click **Usage** tab
3. See real-time metrics:
   - Posts remaining today
   - Next limit reset time
   - Historical usage trends

### Usage Notifications

Enable notifications for:
- 80% of daily limit reached
- Rate limit exceeded
- Unusual posting patterns detected

Configure in **Settings > Notifications**

### Weekly Reports

Receive weekly usage summaries:
- Total posts per platform
- Peak posting times
- Failed posts and reasons
- Recommendations for optimization

Enable in **Settings > Email Preferences**

---

## Platform-Specific Tips

### Twitter Optimization

**Engagement Windows:**
- Weekday mornings (7-9 AM): High engagement
- Lunch hours (12-1 PM): Good engagement
- Evening (6-9 PM): Moderate engagement
- Late night/early morning: Low engagement

**Posting Strategy:**
- 3-5 tweets per day is optimal
- Use threads for longer content
- Retweet your top performers
- Engage with replies to boost reach

### LinkedIn Optimization

**Engagement Windows:**
- Tuesday-Thursday: Best days
- 7-8 AM: Peak engagement
- 12 PM: Good engagement
- 5-6 PM: After-work engagement
- Weekends: Low engagement

**Posting Strategy:**
- 1-2 posts per day maximum
- Focus on professional insights
- Use native LinkedIn content (not links)
- Post during business hours only

---

## Troubleshooting Rate Limits

### "I hit the limit but I haven't posted much"

**Possible causes:**
1. **Deleted posts still count**
   - Even deleted posts consume your limit
   - Wait for the window to reset

2. **Multiple devices/apps**
   - Other apps using your account count toward limit
   - Disconnect unused apps in platform settings

3. **Failed posts consume limits**
   - Some platforms count failed attempts
   - Review error logs in Posts tab

### "My posts are stuck in 'Scheduled'"

**Check:**
1. Account connection status
2. Current rate limit usage
3. Platform API status
4. Network connectivity

**Fix:**
1. Refresh connection in Settings
2. Wait for rate limit reset
3. Check platform status page
4. Contact support if issue persists

### "Rate limit resets but posts still fail"

**Likely causes:**
1. Token expiration - reconnect account
2. Platform API issues - check status
3. Content policy violation - review content
4. Network issues - check connectivity

---

## Advanced: API Rate Limiting

For developers and power users understanding our API:

### Request Authentication

Each API request includes:
- OAuth access token
- API key (if applicable)
- User agent header

### Rate Limit Response Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Continue normally |
| 429 | Rate limit exceeded | Wait and retry |
| 503 | Service unavailable | Temporary, will retry |
| 401 | Auth expired | Reconnect account |

### Batch Operations

When scheduling multiple posts:
- System validates limits before scheduling
- Distributes posts to avoid limits
- Provides warnings if too many scheduled

---

## Getting Help

### Rate Limit Issues

If you're consistently hitting rate limits:

1. **Review your strategy**
   - Are you posting too frequently?
   - Can you spread posts over more days?

2. **Check connected apps**
   - Disconnect unused third-party apps
   - They may be consuming your limits

3. **Contact support**
   - Email: support@repurpose-ai.com
   - Include: Platform, error message, frequency

### Enterprise Limits

Need higher limits?
- Contact sales@repurpose-ai.com
- Discuss your use case
- Custom enterprise plans available

---

**Pro Tip:** The best strategy is quality over quantity. Platforms reward meaningful content with better reach, regardless of post frequency.

---

**Last Updated:** October 16, 2025
**Version:** 1.0
