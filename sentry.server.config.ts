import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust trace sample rate for production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',

  // Disable Sentry if no DSN is provided
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NODE_ENV || 'development',

  // Server-specific integrations
  integrations: [
    Sentry.httpIntegration(),
  ],

  // Add context to errors
  beforeSend(event, hint) {
    // Add server context
    if (event.request) {
      event.tags = {
        ...event.tags,
        serverSide: true,
      };
    }

    return event;
  },

  // Ignore specific errors
  ignoreErrors: [
    // Expected errors that shouldn't alert
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
  ],
});
