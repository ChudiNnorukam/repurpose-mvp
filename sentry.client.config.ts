import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust trace sample rate for production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',

  // Capture 100% of errors for replay
  replaysOnErrorSampleRate: 1.0,

  // Sample 10% of sessions for replay in production, 100% in development
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session replay configuration
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
      maskAllInputs: true,
    }),
    Sentry.browserTracingIntegration({
      // Track page loads and navigation
      enableInp: true,
    }),
  ],

  // Disable Sentry if no DSN is provided
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NODE_ENV || 'development',

  // Filter out known errors
  beforeSend(event, hint) {
    // Filter out browser extension errors
    if (event.exception?.values?.[0]?.value?.includes('chrome-extension://')) {
      return null;
    }
    
    // Filter out network errors from ad blockers
    if (event.exception?.values?.[0]?.value?.includes('blocked by client')) {
      return null;
    }

    return event;
  },

  // Ignore specific errors
  ignoreErrors: [
    // Browser extensions
    'chrome-extension://',
    'moz-extension://',
    // Network errors
    'NetworkError',
    'Network request failed',
    // ResizeObserver (benign error)
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
  ],
});
