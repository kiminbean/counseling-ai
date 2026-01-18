/**
 * API Client
 * 저장 경로: frontend/lib/api.ts
 *
 * 기능:
 * - 에러 핸들링 및 재시도
 * - 타입 안전한 API 호출
 * - 응답 어댑터
 * - CSRF 보호
 */
import { ChatRequest, ChatResponse, ChatResponseFormatted } from '@/types';
import { secureStorage, addCsrfHeader } from '@/lib/security';

export type { ChatResponseFormatted };

// API 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

// 에러 타입
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 재시도 가능한 상태 코드
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

// 지연 함수
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 저장된 토큰 가져오기 (secureStorage 사용)
 */
function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return secureStorage.getToken('access_token');
}

/**
 * API 요청 (재시도 로직 포함)
 */
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  retries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;

  // Authorization 및 CSRF 헤더 추가
  const token = getStoredToken();
  const headers = addCsrfHeader({
    ...options.headers,
    ...(token && { 'Authorization': `Bearer ${token}` }),
  });

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, { ...options, headers });

      // 성공
      if (res.ok) {
        return await res.json() as T;
      }

      // 에러 응답 파싱
      let errorMessage = `HTTP Error: ${res.status}`;
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch {
        // JSON 파싱 실패 시 기본 메시지 사용
      }

      const isRetryable = RETRYABLE_STATUS_CODES.includes(res.status);

      // Rate limit인 경우 더 긴 대기
      if (res.status === 429) {
        const retryAfter = res.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : RETRY_DELAY * 2;
        if (attempt < retries - 1) {
          await delay(waitTime);
          continue;
        }
      }

      // 재시도 가능한 에러
      if (isRetryable && attempt < retries - 1) {
        await delay(RETRY_DELAY * Math.pow(2, attempt)); // 지수 백오프
        continue;
      }

      throw new ApiError(errorMessage, res.status, isRetryable);

    } catch (error) {
      lastError = error as Error;

      // 네트워크 에러 (재시도 가능)
      if (error instanceof TypeError && attempt < retries - 1) {
        await delay(RETRY_DELAY * Math.pow(2, attempt));
        continue;
      }

      // ApiError는 그대로 던짐
      if (error instanceof ApiError) {
        throw error;
      }
    }
  }

  throw lastError || new Error('Unknown error');
}

/**
 * 채팅 메시지 전송
 */
export async function sendMessage(
  message: string,
  userId: string,
  sessionId: string | null,
  language: string = 'ko'
): Promise<ChatResponseFormatted> {
  const url = `${API_BASE_URL}/api/v3/chat/multilingual`;

  const data = await fetchWithRetry<ChatResponse>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': language,
    },
    body: JSON.stringify({
      user_id: userId,
      message: message,
      session_id: sessionId || undefined,
      language: language
    } satisfies Partial<ChatRequest>),
  });

  return adaptResponse(data);
}

/**
 * 익명 토큰 발급
 */
export async function getAnonymousToken(): Promise<{ access_token: string; refresh_token: string }> {
  const url = `${API_BASE_URL}/api/v3/auth/anonymous`;

  return await fetchWithRetry(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * 세션 요약 조회
 */
export async function getSessionSummary(sessionId: string): Promise<{
  session_id: string;
  total_turns: number;
  dominant_emotion: string;
  emotion_distribution: Record<string, number>;
  crisis_detected: boolean;
}> {
  const url = `${API_BASE_URL}/api/v3/sessions/${sessionId}/summary`;

  return await fetchWithRetry(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * 헬스 체크
 */
export async function checkHealth(): Promise<{ status: string; version: string }> {
  const url = `${API_BASE_URL}/health`;

  return await fetchWithRetry(url, {
    method: 'GET',
  }, 1); // 재시도 없음
}

/**
 * 응답 어댑터: 백엔드 응답 → 프론트엔드 형식
 */
function adaptResponse(data: ChatResponse): ChatResponseFormatted {
  // v3 API (emotion_analysis)와 v1 API (emotion) 모두 대응
  const primaryEmotion = data.emotion_analysis?.primary_emotion
    || data.emotion?.label
    || 'neutral';

  return {
    session_id: data.session_id,
    response: data.response_text || data.response || "응답을 불러올 수 없습니다.",
    emotion: {
      label: primaryEmotion,
      confidence: data.emotion_analysis?.intensity || data.emotion?.confidence || 0.5,
      intensity: data.emotion_analysis?.intensity || data.emotion?.intensity || 0.5,
      secondary: data.emotion_analysis?.secondary_emotions || data.emotion?.secondary || []
    },
    is_crisis: data.supervisor_feedback?.intervention_needed || data.is_crisis || false,
    suggested_techniques: data.suggested_techniques || [],
    safety_resources: data.safety_resources
  };
}

/**
 * 사용자 친화적 에러 메시지 변환
 */
export function getErrorMessage(error: unknown, language: string = 'ko'): string {
  if (error instanceof ApiError) {
    const messages: Record<number, { ko: string; en: string }> = {
      400: { ko: '요청을 처리할 수 없습니다.', en: 'Unable to process your request.' },
      401: { ko: '인증이 필요합니다.', en: 'Authentication required.' },
      403: { ko: '접근 권한이 없습니다.', en: 'Access denied.' },
      404: { ko: '요청한 내용을 찾을 수 없습니다.', en: 'Not found.' },
      429: { ko: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.', en: 'Too many requests. Please try again later.' },
      500: { ko: '서버에 일시적인 문제가 발생했습니다.', en: 'A temporary server error occurred.' },
      503: { ko: '서비스가 일시적으로 사용 불가능합니다.', en: 'Service temporarily unavailable.' },
    };

    const msg = messages[error.statusCode];
    if (msg) {
      return language === 'ko' ? msg.ko : msg.en;
    }
  }

  if (error instanceof TypeError) {
    return language === 'ko'
      ? '네트워크 연결을 확인해 주세요.'
      : 'Please check your network connection.';
  }

  return language === 'ko'
    ? '오류가 발생했습니다. 다시 시도해 주세요.'
    : 'An error occurred. Please try again.';
}
