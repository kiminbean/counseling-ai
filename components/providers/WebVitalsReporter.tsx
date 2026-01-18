'use client';

import { useEffect } from 'react';
import { reportWebVitals } from '@/lib/webVitals';

/**
 * Web Vitals 리포팅 컴포넌트
 *
 * Core Web Vitals 메트릭을 수집하고 리포팅합니다.
 * - 개발 모드: 콘솔에 포맷팅된 출력
 * - 프로덕션: GA4로 이벤트 전송
 *
 * 수집 메트릭:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay)
 * - INP (Interaction to Next Paint)
 * - CLS (Cumulative Layout Shift)
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 *
 * 사용법:
 * ```tsx
 * <Providers>
 *   <WebVitalsReporter />
 *   {children}
 * </Providers>
 * ```
 */
export function WebVitalsReporter(): null {
  useEffect(() => {
    reportWebVitals();
  }, []);

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null;
}
