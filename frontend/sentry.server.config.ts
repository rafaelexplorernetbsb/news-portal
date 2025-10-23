import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',

  // Performance Monitoring
  beforeSend(event) {
    // Filter out non-critical errors in production
    if (process.env.NODE_ENV === 'production') {
      // Don't send 404 errors
      if (event.exception?.values?.[0]?.type === 'NotFoundError') {
        return null;
      }

      // Don't send network errors
      if (event.exception?.values?.[0]?.type === 'NetworkError') {
        return null;
      }
    }

    return event;
  },

  // Set user context
  beforeSendTransaction(event) {
    // Add custom tags
    event.tags = {
      ...event.tags,
      environment: process.env.NODE_ENV,
      version: process.env.APP_VERSION || '1.0.0',
    };

    return event;
  },
});
