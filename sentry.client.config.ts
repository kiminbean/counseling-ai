/**
 * Sentry Client-Side Configuration
 *
 * This file configures Sentry error tracking for the browser/client-side.
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
    // Adjust this value in production (lower = less data, less cost)
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Session Replay: Sample rate for all sessions
    replaysSessionSampleRate: 0.1,

    // Session Replay: Sample rate for sessions with errors (100% recommended)
    replaysOnErrorSampleRate: 1.0,

    // Only enable in production to avoid noise during development
    enabled: process.env.NODE_ENV === 'production',

    // Adjust this setting to control PII data handling
    sendDefaultPii: false,

    // Filter out sensitive information from URLs
    beforeSend(event) {
      // Remove sensitive query params if any
      if (event.request?.query_string) {
        const sensitiveParams = ['token', 'key', 'secret', 'password'];
        const params = new URLSearchParams(event.request.query_string);
        sensitiveParams.forEach((param) => {
          if (params.has(param)) {
            params.set(param, '[REDACTED]');
          }
        });
        event.request.query_string = params.toString();
      }
      return event;
    },

    // Ignore specific errors that are not actionable
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      // Network errors
      'Network request failed',
      'Failed to fetch',
      // User-initiated aborts
      'AbortError',
    ],
  });
}
