/**
 * Google Analytics 4 (GA4) 분석 유틸리티
 *
 * GA4를 사용한 사용자 행동 분석을 위한 트래킹 유틸리티입니다.
 *
 * 환경 변수:
 * - NEXT_PUBLIC_GA_MEASUREMENT_ID: GA4 Measurement ID (G-XXXXXXXXXX)
 *
 * 개인정보 보호 원칙:
 * - 메시지 내용 전송 금지
 * - 감정 원시값 전송 금지 (분류만 허용)
 * - 민감한 개인정보 익명화
 */

// ============================================
// 타입 정의
// ============================================

/**
 * GA4 gtag 함수 타입
 */
type GtagCommand = 'config' | 'event' | 'set' | 'js';

interface GtagEventParams {
  event_category?: string;
  event_label?: string;
  value?: number;
  page_path?: string;
  page_title?: string;
  page_location?: string;
  user_id?: string;
  // 커스텀 파라미터
  [key: string]: string | number | boolean | undefined;
}

declare global {
  interface Window {
    gtag: (
      command: GtagCommand,
      targetOrName: string | Date,
      params?: GtagEventParams
    ) => void;
    dataLayer: unknown[];
  }
}

// ============================================
// 환경 설정
// ============================================

const isDevelopment = process.env.NODE_ENV === 'development';
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * GA4 사용 가능 여부
 * - Measurement ID가 설정되어 있어야 함
 * - 브라우저 환경에서만 동작 (SSR 제외)
 */
const isGAEnabled = !!GA_MEASUREMENT_ID;

/**
 * 브라우저 환경 체크 (SSR 안전)
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * gtag 함수 사용 가능 여부
 */
function isGtagAvailable(): boolean {
  return isBrowser() && typeof window.gtag === 'function';
}

// ============================================
// GA4 초기화
// ============================================

/**
 * GA4 스크립트가 로드되었는지 확인
 */
export function isAnalyticsReady(): boolean {
  return isGtagAvailable();
}

/**
 * GA4 Measurement ID 반환 (스크립트 로딩용)
 */
export function getGAMeasurementId(): string | undefined {
  return GA_MEASUREMENT_ID;
}

// ============================================
// 페이지 뷰 트래킹
// ============================================

/**
 * 페이지 뷰 트래킹
 *
 * @param url - 페이지 경로 (예: '/chat', '/profile')
 * @param title - 페이지 제목 (선택)
 *
 * 사용 예시:
 * ```typescript
 * pageview('/chat');
 * pageview('/profile', '프로필');
 * ```
 */
export function pageview(url: string, title?: string): void {
  if (isDevelopment) {
    console.log('[Analytics] pageview:', { url, title });
    return;
  }

  if (!isGAEnabled || !isGtagAvailable()) return;

  window.gtag('config', GA_MEASUREMENT_ID!, {
    page_path: url,
    page_title: title,
    page_location: isBrowser() ? window.location.href : undefined,
  });
}

// ============================================
// 이벤트 트래킹
// ============================================

/**
 * GA4 이벤트 트래킹
 *
 * @param action - 이벤트 액션 (예: 'click', 'submit')
 * @param category - 이벤트 카테고리 (예: 'chat', 'mood')
 * @param label - 이벤트 라벨 (선택)
 * @param value - 이벤트 값 (선택, 숫자)
 * @param additionalParams - 추가 파라미터 (선택)
 *
 * 주의: 개인정보(메시지 내용, 감정 원시값)를 포함하지 마세요.
 *
 * 사용 예시:
 * ```typescript
 * event('send_message', 'chat');
 * event('complete', 'mood_checkin', 'daily');
 * event('start', 'exercise', 'breathing', undefined, { duration: 5 });
 * ```
 */
export function event(
  action: string,
  category: string,
  label?: string,
  value?: number,
  additionalParams?: Record<string, string | number | boolean>
): void {
  if (isDevelopment) {
    console.log('[Analytics] event:', { action, category, label, value, additionalParams });
    return;
  }

  if (!isGAEnabled || !isGtagAvailable()) return;

  const params: GtagEventParams = {
    event_category: category,
  };

  if (label !== undefined) params.event_label = label;
  if (value !== undefined) params.value = value;

  // 추가 파라미터 병합
  if (additionalParams) {
    Object.entries(additionalParams).forEach(([key, val]) => {
      params[key] = val;
    });
  }

  window.gtag('event', action, params);
}

// ============================================
// 사용자 속성 설정
// ============================================

/**
 * GA4 사용자 속성 설정
 *
 * @param properties - 사용자 속성 객체
 *
 * 주의:
 * - 민감한 개인정보(이름, 이메일 등) 포함 금지
 * - 익명화된 속성만 사용 (예: user_type, language_preference)
 *
 * 사용 예시:
 * ```typescript
 * setUserProperties({
 *   user_type: 'registered',
 *   language_preference: 'ko',
 *   theme_preference: 'dark',
 * });
 * ```
 */
export function setUserProperties(
  properties: Record<string, string | number | boolean>
): void {
  if (isDevelopment) {
    console.log('[Analytics] setUserProperties:', properties);
    return;
  }

  if (!isGAEnabled || !isGtagAvailable()) return;

  window.gtag('set', 'user_properties', properties as GtagEventParams);
}

/**
 * 익명 사용자 ID 설정
 *
 * @param userId - 익명화된 사용자 ID (UUID 등)
 *
 * 주의: 실제 사용자 식별 정보(이메일, 전화번호 등) 사용 금지
 */
export function setUserId(userId: string | null): void {
  if (isDevelopment) {
    console.log('[Analytics] setUserId:', userId);
    return;
  }

  if (!isGAEnabled || !isGtagAvailable()) return;

  if (userId) {
    window.gtag('config', GA_MEASUREMENT_ID!, {
      user_id: userId,
    });
  }
}

// ============================================
// 특화된 이벤트 헬퍼 함수
// ============================================

/**
 * 채팅 메시지 전송 이벤트
 * 주의: 메시지 내용은 절대 전송하지 않음
 */
export function trackChatMessage(): void {
  event('send_message', 'chat');
}

/**
 * 기분 체크인 완료 이벤트
 *
 * @param moodCategory - 기분 카테고리 (예: 'great', 'good', 'okay', 'bad', 'terrible')
 */
export function trackMoodCheckin(moodCategory: string): void {
  event('complete', 'mood_checkin', moodCategory);
}

/**
 * 운동/활동 시작 이벤트
 *
 * @param exerciseType - 활동 유형 (예: 'breathing', 'meditation', 'grounding')
 */
export function trackExerciseStart(exerciseType: string): void {
  event('start', 'exercise', exerciseType);
}

/**
 * 운동/활동 완료 이벤트
 *
 * @param exerciseType - 활동 유형
 * @param durationSeconds - 활동 시간 (초)
 */
export function trackExerciseComplete(exerciseType: string, durationSeconds?: number): void {
  event('complete', 'exercise', exerciseType, durationSeconds);
}

/**
 * 위기 핫라인 표시 이벤트
 * 중요한 안전 메트릭으로 사용됨
 */
export function trackCrisisHotlineShown(): void {
  event('show', 'crisis', 'hotline');
}

/**
 * 위기 핫라인 클릭 이벤트
 *
 * @param hotlineType - 핫라인 유형 (예: 'suicide_prevention', 'mental_health')
 */
export function trackCrisisHotlineClick(hotlineType: string): void {
  event('click', 'crisis', hotlineType);
}

/**
 * 오류 발생 이벤트 (비식별화된 에러 정보만)
 *
 * @param errorCategory - 에러 카테고리 (예: 'api', 'network', 'validation')
 * @param errorCode - 에러 코드 (선택)
 */
export function trackError(errorCategory: string, errorCode?: string): void {
  event('error', errorCategory, errorCode);
}

/**
 * 기능 사용 이벤트
 *
 * @param featureName - 기능 이름 (예: 'dark_mode', 'notifications')
 * @param action - 액션 (예: 'enable', 'disable', 'use')
 */
export function trackFeatureUsage(featureName: string, action: string): void {
  event(action, 'feature', featureName);
}
