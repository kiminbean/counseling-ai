/**
 * Sentry Edge Runtime Configuration
 *
 * This file configures Sentry error tracking for the Edge runtime (middleware, edge functions).
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
  });
}
