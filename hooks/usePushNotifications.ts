/**
 * Push Notifications Hook
 * 저장 경로: frontend/hooks/usePushNotifications.ts
 *
 * React Hook for managing push notification state and permissions
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MessagePayload } from 'firebase/messaging';
import {
  isPushSupported,
  isFirebaseConfigured,
  getNotificationPermission,
  requestNotificationPermission,
  getFCMToken,
  getCachedToken,
  isTokenRefreshNeeded,
  saveFCMTokenToServer,
  onMessageReceived,
} from '@/lib/pushNotifications';

export interface PushNotificationState {
  /** 브라우저 환경에서 푸시 알림 지원 여부 */
  isSupported: boolean;
  /** Firebase 설정이 완료되었는지 여부 */
  isConfigured: boolean;
  /** 현재 알림 권한 상태 */
  permission: NotificationPermission;
  /** FCM 토큰 (획득 성공 시) */
  token: string | null;
  /** 초기화 중 여부 */
  isLoading: boolean;
  /** 에러 상태 */
  error: Error | null;
}

export interface UsePushNotificationsReturn extends PushNotificationState {
  /** 알림 권한 요청 및 토큰 획득 */
  requestPermission: () => Promise<boolean>;
  /** 포그라운드 메시지 수신 리스너 등록 */
  subscribe: (callback: (payload: MessagePayload) => void) => () => void;
}

/**
 * 푸시 알림 관리 훅
 *
 * @param userId 사용자 ID (토큰 서버 저장 시 사용)
 * @param autoInit 자동 초기화 여부 (기본: false)
 *
 * @example
 * ```tsx
 * const { isSupported, permission, token, requestPermission } = usePushNotifications();
 *
 * // 권한 요청 버튼
 * <button onClick={requestPermission} disabled={permission === 'denied'}>
 *   알림 켜기
 * </button>
 * ```
 */
export function usePushNotifications(
  userId?: string,
  autoInit: boolean = false
): UsePushNotificationsReturn {
  const [state, setState] = useState<PushNotificationState>(() => ({
    isSupported: false,
    isConfigured: false,
    permission: 'default',
    token: null,
    isLoading: true,
    error: null,
  }));

  // 구독 해제 함수들을 저장
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // 초기화
  useEffect(() => {
    // SSR 환경 체크
    if (typeof window === 'undefined') {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    const isSupported = isPushSupported();
    const isConfigured = isFirebaseConfigured();
    const permission = getNotificationPermission();
    const cachedToken = getCachedToken();

    setState((prev) => ({
      ...prev,
      isSupported,
      isConfigured,
      permission,
      token: cachedToken,
      isLoading: false,
    }));

    // 권한이 이미 granted이고 토큰 갱신 필요한 경우 자동 갱신
    if (
      isSupported &&
      isConfigured &&
      permission === 'granted' &&
      (autoInit || isTokenRefreshNeeded())
    ) {
      refreshToken();
    }
  }, [autoInit]);

  /**
   * 토큰 갱신 (권한 granted 상태에서)
   */
  const refreshToken = useCallback(async () => {
    try {
      const token = await getFCMToken();
      if (token) {
        // 서버에 토큰 저장
        await saveFCMTokenToServer(token, userId);
        setState((prev) => ({ ...prev, token }));
      }
    } catch (error) {
      console.error('[usePushNotifications] Token refresh failed:', error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Token refresh failed'),
      }));
    }
  }, [userId]);

  /**
   * 알림 권한 요청 및 토큰 획득
   * @returns 성공 여부
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // 1. 권한 요청
      const permission = await requestNotificationPermission();

      setState((prev) => ({ ...prev, permission }));

      if (permission !== 'granted') {
        setState((prev) => ({ ...prev, isLoading: false }));
        return false;
      }

      // 2. FCM 토큰 획득
      const token = await getFCMToken();

      if (!token) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: new Error('Failed to get FCM token'),
        }));
        return false;
      }

      // 3. 서버에 토큰 저장
      await saveFCMTokenToServer(token, userId);

      setState((prev) => ({ ...prev, token, isLoading: false }));
      return true;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Permission request failed'),
      }));
      return false;
    }
  }, [userId]);

  /**
   * 포그라운드 메시지 구독
   * @param callback 메시지 수신 콜백
   * @returns 구독 해제 함수
   */
  const subscribe = useCallback(
    (callback: (payload: MessagePayload) => void): (() => void) => {
      // 기존 구독 해제
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      const unsubscribe = onMessageReceived(callback);

      if (unsubscribe) {
        unsubscribeRef.current = unsubscribe;
        return unsubscribe;
      }

      // 구독 실패 시 no-op 함수 반환
      return () => {};
    },
    []
  );

  // 컴포넌트 언마운트 시 구독 해제
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  return {
    ...state,
    requestPermission,
    subscribe,
  };
}
