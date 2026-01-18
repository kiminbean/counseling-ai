/**
 * Web Vitals 수집 및 리포팅 유틸리티
 *
 * Core Web Vitals 메트릭을 수집하고 GA4 또는 콘솔로 리포팅합니다.
 * - LCP (Largest Contentful Paint): 최대 콘텐츠 렌더링 시간
 * - FID (First Input Delay): 첫 입력 지연 → INP로 대체 중
 * - INP (Interaction to Next Paint): 상호작용 응답성
 * - CLS (Cumulative Layout Shift): 누적 레이아웃 이동
 * - FCP (First Contentful Paint): 첫 콘텐츠 렌더링 시간
 * - TTFB (Time to First Byte): 첫 바이트 수신 시간
 *
 * @see https://web.dev/vitals/
 */

import type { Metric, LCPMetric, CLSMetric, FCPMetric, TTFBMetric, INPMetric } from 'web-vitals';
import { event } from './analytics';

// ============================================
// 타입 정의
// ============================================

// FIDMetric was removed in web-vitals v4 (FID deprecated in favor of INP)
type WebVitalsMetric = LCPMetric | CLSMetric | FCPMetric | TTFBMetric | INPMetric;

type MetricRating = 'good' | 'needs-improvement' | 'poor';

interface MetricThreshold {
  good: number;
  poor: number;
}

// ============================================
// 환경 설정
// ============================================

const isDevelopment = process.env.NODE_ENV === 'development';

// ============================================
// Core Web Vitals 임계값
// ============================================

/**
 * Google의 Core Web Vitals 임계값
 * @see https://web.dev/metrics/
 */
const THRESHOLDS: Record<string, MetricThreshold> = {
  // LCP: 2.5s 이하 = good, 4s 초과 = poor
  LCP: { good: 2500, poor: 4000 },
  // FID: 100ms 이하 = good, 300ms 초과 = poor
  FID: { good: 100, poor: 300 },
  // INP: 200ms 이하 = good, 500ms 초과 = poor
  INP: { good: 200, poor: 500 },
  // CLS: 0.1 이하 = good, 0.25 초과 = poor
  CLS: { good: 0.1, poor: 0.25 },
  // FCP: 1.8s 이하 = good, 3s 초과 = poor
  FCP: { good: 1800, poor: 3000 },
  // TTFB: 800ms 이하 = good, 1800ms 초과 = poor
  TTFB: { good: 800, poor: 1800 },
};

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 메트릭 값에 따른 품질 등급 판정
 *
 * @param name - 메트릭 이름 (LCP, FID, CLS 등)
 * @param value - 메트릭 값
 * @returns 품질 등급 ('good', 'needs-improvement', 'poor')
 */
function getRating(name: string, value: number): MetricRating {
  const threshold = THRESHOLDS[name];
  if (!threshold) return 'needs-improvement';

  if (value <= threshold.good) return 'good';
  if (value > threshold.poor) return 'poor';
  return 'needs-improvement';
}

/**
 * 메트릭 값 포맷팅 (콘솔 출력용)
 *
 * @param name - 메트릭 이름
 * @param value - 메트릭 값
 * @returns 포맷팅된 문자열
 */
function formatValue(name: string, value: number): string {
  // CLS는 소수점으로 표시
  if (name === 'CLS') {
    return value.toFixed(3);
  }
  // 나머지는 ms 단위
  return `${Math.round(value)}ms`;
}

/**
 * 품질 등급에 따른 콘솔 색상
 */
function getRatingColor(rating: MetricRating): string {
  switch (rating) {
    case 'good':
      return '#0cce6b'; // 녹색
    case 'needs-improvement':
      return '#ffa400'; // 주황색
    case 'poor':
      return '#ff4e42'; // 빨간색
  }
}

// ============================================
// GA4 리포팅
// ============================================

/**
 * 메트릭을 GA4로 전송
 *
 * @param metric - web-vitals 메트릭 객체
 */
function sendToAnalytics(metric: Metric): void {
  const rating = getRating(metric.name, metric.value);

  // GA4 이벤트로 전송
  // event(action, category, label, value, additionalParams)
  event(
    'web_vitals',
    'performance',
    metric.name,
    Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    {
      metric_id: metric.id,
      metric_rating: rating,
      metric_delta: Math.round(metric.delta),
      navigation_type: metric.navigationType || 'unknown',
    }
  );
}

// ============================================
// 콘솔 리포팅 (개발 모드)
// ============================================

/**
 * 메트릭을 콘솔에 출력 (개발 모드 전용)
 *
 * @param metric - web-vitals 메트릭 객체
 */
function logToConsole(metric: Metric): void {
  const rating = getRating(metric.name, metric.value);
  const color = getRatingColor(rating);
  const formattedValue = formatValue(metric.name, metric.value);

  console.log(
    `%c[Web Vitals] ${metric.name}: ${formattedValue} (${rating})`,
    `color: ${color}; font-weight: bold;`
  );
  console.log(`  ID: ${metric.id}`);
  console.log(`  Delta: ${formatValue(metric.name, metric.delta)}`);
  console.log(`  Navigation: ${metric.navigationType || 'unknown'}`);
}

// ============================================
// 메트릭 핸들러
// ============================================

/**
 * 메트릭 리포팅 핸들러
 *
 * 개발 모드에서는 콘솔에 출력하고,
 * 프로덕션에서는 GA4로 전송합니다.
 *
 * @param metric - web-vitals 메트릭 객체
 */
function handleMetric(metric: WebVitalsMetric): void {
  if (isDevelopment) {
    logToConsole(metric);
  }
  // 프로덕션에서도 항상 GA4로 전송 (analytics.ts에서 환경 체크)
  sendToAnalytics(metric);
}

// ============================================
// 메인 함수
// ============================================

/**
 * Web Vitals 수집 및 리포팅 시작
 *
 * 이 함수를 호출하면 모든 Core Web Vitals 메트릭을 수집하고
 * 자동으로 리포팅합니다.
 *
 * 사용법:
 * ```tsx
 * 'use client';
 * import { useEffect } from 'react';
 * import { reportWebVitals } from '@/lib/webVitals';
 *
 * export function WebVitalsReporter() {
 *   useEffect(() => {
 *     reportWebVitals();
 *   }, []);
 *   return null;
 * }
 * ```
 */
export async function reportWebVitals(): Promise<void> {
  // 클라이언트 환경에서만 실행
  if (typeof window === 'undefined') return;

  try {
    // 동적 import로 web-vitals 로드 (코드 스플리팅)
    // Note: onFID was removed in web-vitals v4 (FID deprecated in favor of INP)
    const { onCLS, onFCP, onLCP, onTTFB, onINP } = await import('web-vitals');

    // Core Web Vitals (LCP, CLS, INP)
    onLCP(handleMetric);
    onCLS(handleMetric);
    onINP(handleMetric); // INP replaced FID as Core Web Vital

    // 보조 메트릭
    onFCP(handleMetric);
    onTTFB(handleMetric);

    if (isDevelopment) {
      console.log('%c[Web Vitals] Monitoring started', 'color: #0ea5e9; font-weight: bold;');
    }
  } catch (error) {
    if (isDevelopment) {
      console.error('[Web Vitals] Failed to initialize:', error);
    }
  }
}

// ============================================
// 추가 유틸리티
// ============================================

/**
 * 현재 페이지의 Core Web Vitals 상태 요약
 * (디버깅 및 개발 도구용)
 */
export function getWebVitalsStatus(): Record<string, string> {
  return Object.entries(THRESHOLDS).reduce(
    (acc, [name, threshold]) => ({
      ...acc,
      [name]: `good <= ${threshold.good}${name === 'CLS' ? '' : 'ms'}, poor > ${threshold.poor}${name === 'CLS' ? '' : 'ms'}`,
    }),
    {}
  );
}
