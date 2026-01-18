/**
 * Sentry Server-Side Configuration
 *
 * This file configures Sentry error tracking for the server-side (Node.js runtime).
 * It will only initialize Sentry if NEXT_PUBLIC_SENTRY_DSN is set.
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

// Only initialize Sentry if DSN is configured
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,

    // Performance Monitoring: Sample rate for transactions
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Only enable in production
    enabled: process.env.NODE_ENV === 'production',

    // Filter out sensitive information
    beforeSend(event) {
      // Remove sensitive headers if any
      if (event.request?.headers) {
        const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
        sensitiveHeaders.forEach((header) => {
          if (event.request?.headers?.[header]) {
            event.request.headers[header] = '[REDACTED]';
          }
        });
      }
      return event;
    },
  });
}
