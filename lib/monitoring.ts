/**
 * 모니터링 및 에러 트래킹 유틸리티
 *
 * Sentry를 사용한 프로덕션 에러 트래킹과 개발 환경용 콘솔 로깅을 제공합니다.
 *
 * 환경 변수:
 * - NEXT_PUBLIC_SENTRY_DSN: Sentry DSN (설정 시 Sentry 활성화)
 * - NEXT_PUBLIC_ENVIRONMENT: production | staging | development
 */

import type * as SentryType from '@sentry/nextjs';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface ErrorContext {
  userId?: string;
  sessionId?: string;
  page?: string;
  action?: string;
  extra?: Record<string, unknown>;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 's' | 'bytes' | 'count';
  tags?: Record<string, string>;
}

// 환경 설정
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development';

// Sentry DSN (설정 시 Sentry 활성화)
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

// Sentry 사용 가능 여부 (프로덕션 + DSN 설정)
const isSentryEnabled = isProduction && !!SENTRY_DSN;

/**
 * Sentry 모듈을 동적으로 로드
 * 빌드 시 DSN이 없어도 에러 없이 동작하도록 함
 */
async function getSentry(): Promise<typeof SentryType | null> {
  if (!isSentryEnabled) return null;

  try {
    const Sentry = await import('@sentry/nextjs');
    return Sentry;
  } catch (error) {
    console.warn('[Monitoring] Sentry not available:', error);
    return null;
  }
}

/**
 * 모니터링 초기화
 * 참고: Sentry는 sentry.client.config.ts에서 자동 초기화됩니다.
 * 이 함수는 추가적인 설정이 필요한 경우 사용됩니다.
 */
export async function initMonitoring(): Promise<void> {
  if (!isProduction) {
    console.log('[Monitoring] Development mode - using console logging');
    return;
  }

  if (SENTRY_DSN) {
    console.log('[Monitoring] Sentry enabled for production');
  } else {
    console.log('[Monitoring] Sentry DSN not configured - using console logging');
  }
}

/**
 * 에러 캡처
 * 프로덕션 환경에서 Sentry로 에러를 전송하고, 개발 환경에서는 콘솔에 기록합니다.
 */
export function captureError(
  error: Error | string,
  context?: ErrorContext
): void {
  const errorObj = typeof error === 'string' ? new Error(error) : error;

  // 항상 콘솔에 에러 기록 (개발 디버깅용)
  console.error('[Error]', errorObj.message, context);

  // 프로덕션에서 Sentry로 에러 전송
  if (isSentryEnabled && typeof window !== 'undefined') {
    getSentry().then((Sentry) => {
      if (!Sentry) return;

      Sentry.captureException(errorObj, {
        tags: {
          page: context?.page,
          action: context?.action,
          environment,
        },
        user: context?.userId ? { id: context.userId } : undefined,
        extra: {
          sessionId: context?.sessionId,
          ...context?.extra,
        },
      });
    }).catch(() => {
      // Sentry 전송 실패 시 무시 (콘솔에는 이미 기록됨)
    });
  }
}

/**
 * 사용자 정보 설정 (인증 후 호출)
 * Sentry에서 에러를 사용자별로 추적할 수 있게 합니다.
 */
export function setUser(userId: string | null): void {
  if (!isSentryEnabled) {
    if (isDevelopment) {
      console.log('[Monitoring] setUser:', userId);
    }
    return;
  }

  getSentry().then((Sentry) => {
    if (!Sentry) return;

    if (userId) {
      Sentry.setUser({ id: userId });
    } else {
      Sentry.setUser(null);
    }
  }).catch(() => {
    // Sentry 설정 실패 시 무시
  });
}

/**
 * 커스텀 이벤트 로깅
 */
export function logEvent(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  if (isDevelopment) {
    console.log('[Event]', eventName, properties);
    return;
  }

  // Google Analytics, Mixpanel 등 연동 가능
  if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', eventName, properties);
  }
}

/**
 * 성능 메트릭 기록
 */
export function recordMetric(metric: PerformanceMetric): void {
  if (isDevelopment) {
    console.log('[Metric]', `${metric.name}: ${metric.value}${metric.unit}`);
    return;
  }

  // Sentry에 성능 메트릭 기록 (Custom Measurements)
  if (isSentryEnabled && typeof window !== 'undefined') {
    getSentry().then((Sentry) => {
      if (!Sentry) return;

      // Sentry breadcrumb으로 메트릭 기록
      Sentry.addBreadcrumb({
        category: 'metric',
        message: `${metric.name}: ${metric.value}${metric.unit}`,
        level: 'info',
        data: metric.tags,
      });
    }).catch(() => {
      // 실패 시 무시
    });
  }

  // 콘솔에도 기록 (프로덕션 디버깅용)
  console.log('[Metric]', `${metric.name}: ${metric.value}${metric.unit}`, metric.tags);
}

/**
 * 페이지 뷰 기록
 */
export function trackPageView(pageName: string, properties?: Record<string, string>): void {
  logEvent('page_view', { page: pageName, ...properties });
}

/**
 * 사용자 액션 기록
 */
export function trackAction(
  action: string,
  category: string,
  properties?: Record<string, unknown>
): void {
  logEvent(action, { category, ...properties });
}

/**
 * API 호출 성능 측정
 */
export function measureApiCall(
  endpoint: string,
  startTime: number
): void {
  const duration = Date.now() - startTime;
  recordMetric({
    name: 'api_call_duration',
    value: duration,
    unit: 'ms',
    tags: { endpoint },
  });
}

/**
 * 콘솔 로거 (레벨별)
 * Sentry에 breadcrumb으로 기록하여 에러 발생 시 컨텍스트 제공
 */
export const logger = {
  debug: (message: string, ...args: unknown[]) => {
    if (isDevelopment) console.debug(`[DEBUG] ${message}`, ...args);
  },
  info: (message: string, ...args: unknown[]) => {
    console.info(`[INFO] ${message}`, ...args);
    // Sentry breadcrumb 추가
    if (isSentryEnabled && typeof window !== 'undefined') {
      getSentry().then((Sentry) => {
        Sentry?.addBreadcrumb({
          category: 'log',
          message,
          level: 'info',
        });
      }).catch(() => {});
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${message}`, ...args);
    // Sentry breadcrumb 추가
    if (isSentryEnabled && typeof window !== 'undefined') {
      getSentry().then((Sentry) => {
        Sentry?.addBreadcrumb({
          category: 'log',
          message,
          level: 'warning',
        });
      }).catch(() => {});
    }
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(`[ERROR] ${message}`, ...args);
    if (isProduction) {
      captureError(new Error(message), { extra: { args } });
    }
  },
};

/**
 * Web Vitals 측정 (next/web-vitals 연동용)
 */
export function reportWebVitals(metric: {
  id: string;
  name: string;
  value: number;
  label: 'web-vital' | 'custom';
}): void {
  recordMetric({
    name: `web_vital_${metric.name.toLowerCase()}`,
    value: metric.value,
    unit: 'ms',
    tags: { label: metric.label },
  });
}

/**
 * Breadcrumb 추가 (Sentry 전용)
 * 에러 발생 시 추가 컨텍스트를 제공합니다.
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>
): void {
  if (!isSentryEnabled) return;

  getSentry().then((Sentry) => {
    Sentry?.addBreadcrumb({
      category,
      message,
      level: 'info',
      data,
    });
  }).catch(() => {});
}

/**
 * 커스텀 태그 설정 (Sentry 전용)
 * 모든 후속 이벤트에 태그가 추가됩니다.
 */
export function setTag(key: string, value: string): void {
  if (!isSentryEnabled) return;

  getSentry().then((Sentry) => {
    Sentry?.setTag(key, value);
  }).catch(() => {});
}

/**
 * 커스텀 컨텍스트 설정 (Sentry 전용)
 */
export function setContext(name: string, context: Record<string, unknown>): void {
  if (!isSentryEnabled) return;

  getSentry().then((Sentry) => {
    Sentry?.setContext(name, context);
  }).catch(() => {});
}
