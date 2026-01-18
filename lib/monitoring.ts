/**
 * 모니터링 및 에러 트래킹 유틸리티
 *
 * 현재는 콘솔 로깅만 구현. Sentry 등 외부 서비스 연동 시 이 파일만 수정하면 됨.
 *
 * 환경 변수:
 * - NEXT_PUBLIC_SENTRY_DSN: Sentry DSN (설정 시 Sentry 활성화)
 * - NEXT_PUBLIC_ENVIRONMENT: production | staging | development
 */

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

/**
 * 모니터링 초기화
 * app/layout.tsx에서 호출
 */
export async function initMonitoring(): Promise<void> {
  if (!isProduction) {
    console.log('[Monitoring] Development mode - using console logging');
    return;
  }

  if (SENTRY_DSN) {
    // Sentry 초기화는 @sentry/nextjs 패키지 설치 후 활성화
    // npm install @sentry/nextjs
    console.log('[Monitoring] Sentry DSN configured. Install @sentry/nextjs to enable.');
  }
}

/**
 * 에러 캡처
 */
export function captureError(
  error: Error | string,
  context?: ErrorContext
): void {
  const errorObj = typeof error === 'string' ? new Error(error) : error;

  // 콘솔에 에러 기록
  console.error('[Error]', errorObj.message, context);

  // 프로덕션에서 Sentry 사용 시 활성화
  // @sentry/nextjs 설치 후 아래 코드 활성화
  /*
  if (isProduction && SENTRY_DSN) {
    import('@sentry/nextjs').then((Sentry) => {
      Sentry.captureException(errorObj, {
        tags: { page: context?.page, action: context?.action },
        user: context?.userId ? { id: context.userId } : undefined,
        extra: { sessionId: context?.sessionId, ...context?.extra },
      });
    });
  }
  */
}

/**
 * 사용자 정보 설정 (인증 후 호출)
 */
export function setUser(userId: string | null): void {
  if (!isProduction || !SENTRY_DSN) return;

  // @sentry/nextjs 설치 후 활성화
  console.log('[Monitoring] setUser:', userId);
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

  // @sentry/nextjs 설치 후 Sentry 성능 모니터링 활성화
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
 */
export const logger = {
  debug: (message: string, ...args: unknown[]) => {
    if (isDevelopment) console.debug(`[DEBUG] ${message}`, ...args);
  },
  info: (message: string, ...args: unknown[]) => {
    console.info(`[INFO] ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${message}`, ...args);
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
