'use client';

import { WifiOff, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useState } from 'react';

interface OfflineAlertProps {
  /**
   * 서버 ping URL (선택)
   */
  pingUrl?: string;
}

/**
 * 오프라인 상태 알림 배너
 *
 * 인터넷 연결이 끊어지면 화면 상단에 알림 표시
 */
export function OfflineAlert({ pingUrl }: OfflineAlertProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const { isOnline, isServerReachable, checkServer } = useOnlineStatus({
    pingUrl,
    pingInterval: 30000,
  });

  const handleRetry = async () => {
    setIsRetrying(true);
    await checkServer();
    setIsRetrying(false);
  };

  // 온라인이고 서버 연결 가능하면 표시 안함
  if (isOnline && (isServerReachable === null || isServerReachable)) {
    return null;
  }

  const message = !isOnline
    ? '인터넷 연결이 끊어졌습니다'
    : '서버에 연결할 수 없습니다';

  const subMessage = !isOnline
    ? '연결이 복구되면 자동으로 재연결됩니다'
    : '잠시 후 다시 시도해 주세요';

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-3 shadow-lg"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <WifiOff className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">{message}</p>
            <p className="text-sm text-amber-100">{subMessage}</p>
          </div>
        </div>

        {pingUrl && isOnline && (
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            aria-label="서버 연결 재시도"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            재시도
          </button>
        )}
      </div>
    </div>
  );
}

export default OfflineAlert;
