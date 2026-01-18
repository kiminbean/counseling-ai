/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');

const isProduction = process.env.NODE_ENV === 'production';

// Base security headers
const securityHeaders = [
  // XSS 공격 방지
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  // MIME 타입 스니핑 방지
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Clickjacking 방지
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // Referrer 정보 제한
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // 권한 정책 (카메라, 마이크 등 제한)
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

// Production-only security headers
const productionHeaders = [
  // HSTS (Production Only)
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
];

// Build CSP based on environment
const buildCSP = () => {
  const directives = [
    "default-src 'self'",
    isProduction
      ? "script-src 'self' 'unsafe-inline'"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    isProduction
      ? "connect-src 'self'"
      : "connect-src 'self' http://127.0.0.1:8000 http://localhost:8000",
    "frame-ancestors 'none'",
  ];
  return directives.join('; ');
};

const nextConfig = {
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
      {
        source: '/health',
        destination: `${apiUrl}/health`,
      },
    ];
  },

  async headers() {
    const headers = [
      ...securityHeaders,
      ...(isProduction ? productionHeaders : []),
      {
        key: 'Content-Security-Policy',
        value: buildCSP(),
      },
    ];

    return [
      {
        source: '/:path*',
        headers,
      },
    ];
  },
};

// Sentry configuration options
const sentryBuildOptions = {
  // Suppresses source map uploading logs during build
  silent: true,
  // Organization and project slug for source map uploads (optional without auth token)
  org: process.env.SENTRY_ORG || '',
  project: process.env.SENTRY_PROJECT || '',
};

const sentryOptions = {
  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
  // Hides source maps from generated client bundles
  hideSourceMaps: true,
  // Transpiles SDK to be compatible with IE11 (increases bundle size)
  transpileClientSDK: false,
  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers
  tunnelRoute: '/monitoring',
  // Enables automatic instrumentation of Vercel Cron Monitors (does not yet work with Next.js 14 app router)
  automaticVercelMonitors: false,
};

// Only wrap with Sentry if DSN is configured
// This allows the app to build and run without Sentry credentials
const hasSentryDSN = !!process.env.NEXT_PUBLIC_SENTRY_DSN;

module.exports = hasSentryDSN
  ? withSentryConfig(nextConfig, sentryBuildOptions, sentryOptions)
  : nextConfig;
