# Sentry Error Monitoring Setup Guide

## Overview

Sentry is configured for comprehensive error monitoring across the Repurpose application, including:
- Client-side error tracking with session replay
- Server-side error tracking
- Edge runtime error tracking
- Integration with custom logger
- Automatic error boundary fallbacks

## Quick Start

### 1. Create a Sentry Account

1. Go to [sentry.io](https://sentry.io) and sign up or log in
2. Create a new project:
   - Platform: **Next.js**
   - Project name: **repurpose-mvp** (or your preferred name)
3. Save the DSN provided (looks like: `https://xxx@xxx.ingest.sentry.io/xxx`)

### 2. Configure Environment Variables in Vercel

Add the following environment variables in your Vercel project settings:

#### Required (Production):
```
NEXT_PUBLIC_SENTRY_DSN=<your-sentry-dsn>
```

#### Optional (for source maps upload):
```
SENTRY_AUTH_TOKEN=<your-sentry-auth-token>
SENTRY_ORG=<your-sentry-org-slug>
SENTRY_PROJECT=<your-sentry-project-slug>
```

### 3. Get Sentry Auth Token (Optional)

To upload source maps for better stack traces:

1. Go to Sentry > Settings > Account > API > Auth Tokens
2. Create a new token with **project:write** scope
3. Copy the token and add it to Vercel as `SENTRY_AUTH_TOKEN`

### 4. Deploy

Once environment variables are set, deploy your application. Sentry will automatically start capturing errors.

## Configuration Details

### Sampling Rates

The configuration uses different sampling rates for development vs production:

- **Production:**
  - Traces: 10% (tracesSampleRate: 0.1)
  - Session Replay: 10% (replaysSessionSampleRate: 0.1)
  - Errors: 100% (replaysOnErrorSampleRate: 1.0)

- **Development:**
  - Traces: 100%
  - Session Replay: 100%
  - Errors: 100%

### What Gets Captured

#### Automatically Captured:
- Uncaught JavaScript errors
- Unhandled promise rejections
- React component errors (via Error Boundary)
- Server-side errors
- API route errors
- Edge function errors

#### Via Logger Integration:
- `logger.error()` - Captures exceptions to Sentry
- `logger.warn()` - Sends warnings to Sentry
- `logger.info()` - Adds breadcrumbs for context

### Filtered Errors

The following errors are automatically filtered out:
- Browser extension errors (`chrome-extension://`, `moz-extension://`)
- Ad blocker network errors
- ResizeObserver errors (benign browser issue)
- Expected network errors (ECONNREFUSED, ETIMEDOUT, ENOTFOUND)

## Features Enabled

### 1. Session Replay
- Captures video-like reproductions of user sessions when errors occur
- Privacy-focused: masks all text, inputs, and media by default
- Enabled for all errors in production

### 2. Performance Monitoring
- Tracks page load times
- Monitors API response times
- Measures web vitals (INP, LCP, FID)

### 3. Source Maps
- Automatically uploaded during production builds (if auth token provided)
- Provides readable stack traces
- Hidden from client bundles

### 4. Error Boundary
- React error boundary wraps the entire application
- Provides user-friendly fallback UI
- Automatically reports React errors to Sentry

## Monitoring Best Practices

### 1. Check Sentry Dashboard Regularly
- Monitor error frequency and trends
- Set up alerts for critical errors
- Review session replays for UX issues

### 2. Use Error Context
Always provide context when logging errors:
```typescript
logger.error('Failed to post tweet', error, {
  userId: user.id,
  platform: 'twitter',
  postId: post.id
})
```

### 3. Set User Context
In your authentication flow, set user context:
```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.setUser({
  id: user.id,
  email: user.email,
})
```

### 4. Add Custom Tags
Tag errors for better filtering:
```typescript
Sentry.setTag('feature', 'post-scheduling')
Sentry.captureException(error)
```

## Troubleshooting

### Errors Not Appearing in Sentry

1. **Check DSN is set**: Verify `NEXT_PUBLIC_SENTRY_DSN` is set in Vercel
2. **Check Sentry is enabled**: Look for `enabled: true` in browser console (dev mode)
3. **Check environment**: Ensure you're in the right Sentry project
4. **Check filters**: Some errors may be filtered out (see configuration)

### Source Maps Not Uploading

1. **Check auth token**: Verify `SENTRY_AUTH_TOKEN` is set
2. **Check org/project**: Verify `SENTRY_ORG` and `SENTRY_PROJECT` match your Sentry account
3. **Check build logs**: Look for "Sentry" in Vercel build logs

### Too Many Events

Adjust sampling rates in sentry config files:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`

## Cost Management

Sentry has usage-based pricing. To stay within free tier (5,000 events/month):

1. **Adjust sampling rates**: Lower `tracesSampleRate` and `replaysSessionSampleRate`
2. **Add more filters**: Filter out non-critical errors in `ignoreErrors` array
3. **Use alerts wisely**: Only alert on critical errors
4. **Archive old issues**: Regularly archive resolved issues

## Support

For Sentry-specific issues:
- Documentation: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- Support: https://sentry.io/support/

For application-specific issues:
- Check application logs in Vercel
- Review Sentry session replays
- Check GitHub issues
