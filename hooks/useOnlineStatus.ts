'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseOnlineStatusOptions {
  /**
   * 온라인/오프라인 상태 변경 시 콜백
   */
  onStatusChange?: (isOnline: boolean) => void;

  /**
   * 서버 연결 확인 URL (선택)
   * 설정 시 실제 서버 연결 상태도 확인
   */
  pingUrl?: string;

  /**
   * 서버 ping 간격 (ms)
   * @default 30000 (30초)
   */
  pingInterval?: number;
}

interface OnlineStatus {
  /**
   * 브라우저 온라인 상태
   */
  isOnline: boolean;

  /**
   * 서버 연결 가능 여부 (pingUrl 설정 시)
   */
  isServerReachable: boolean | null;

  /**
   * 마지막 온라인 시간
   */
  lastOnlineAt: Date | null;

  /**
   * 수동으로 서버 연결 확인
   */
  checkServer: () => Promise<boolean>;
}

/**
 * 온라인/오프라인 상태 감지 훅
 *
 * @example
 * ```tsx
 * const { isOnline, isServerReachable } = useOnlineStatus({
 *   onStatusChange: (online) => {
 *     if (!online) toast.warning('인터넷 연결이 끊어졌습니다');
 *   },
 *   pingUrl: '/api/health',
 * });
 * ```
 */
export function useOnlineStatus(options: UseOnlineStatusOptions = {}): OnlineStatus {
  const { onStatusChange, pingUrl, pingInterval = 30000 } = options;

  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isServerReachable, setIsServerReachable] = useState<boolean | null>(null);
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(
    typeof navigator !== 'undefined' && navigator.onLine ? new Date() : null
  );

  // 서버 연결 확인 함수
  const checkServer = useCallback(async (): Promise<boolean> => {
    if (!pingUrl) return true;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(pingUrl, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const reachable = response.ok;
      setIsServerReachable(reachable);
      return reachable;
    } catch {
      setIsServerReachable(false);
      return false;
    }
  }, [pingUrl]);

  // 온라인 상태 변경 핸들러
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastOnlineAt(new Date());
      onStatusChange?.(true);

      // 온라인 복귀 시 서버 연결 확인
      if (pingUrl) {
        checkServer();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsServerReachable(false);
      onStatusChange?.(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onStatusChange, pingUrl, checkServer]);

  // 주기적 서버 연결 확인
  useEffect(() => {
    if (!pingUrl || !isOnline) return;

    // 초기 확인
    checkServer();

    // 주기적 확인
    const intervalId = setInterval(checkServer, pingInterval);

    return () => clearInterval(intervalId);
  }, [pingUrl, pingInterval, isOnline, checkServer]);

  return {
    isOnline,
    isServerReachable,
    lastOnlineAt,
    checkServer,
  };
}

export default useOnlineStatus;
