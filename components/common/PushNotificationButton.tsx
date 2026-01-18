'use client';

/**
 * Push Notification Button Component
 * 저장 경로: frontend/components/common/PushNotificationButton.tsx
 *
 * 푸시 알림 활성화/상태 표시 버튼
 * - 브라우저 지원 여부 확인
 * - 권한 상태에 따른 UI 변경
 * - 권한 요청 및 FCM 토큰 획득
 */

import { Bell, BellOff, Check, Loader2 } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface PushNotificationButtonProps {
  /** 버튼 클래스 추가 */
  className?: string;
  /** 사용자 ID (토큰 저장 시 사용) */
  userId?: string;
  /** 컴팩트 모드 (아이콘만 표시) */
  compact?: boolean;
}

/**
 * 푸시 알림 활성화 버튼
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <PushNotificationButton />
 *
 * // 사용자 ID 전달
 * <PushNotificationButton userId="user-123" />
 *
 * // 컴팩트 모드 (아이콘만)
 * <PushNotificationButton compact />
 * ```
 */
export function PushNotificationButton({
  className = '',
  userId,
  compact = false,
}: PushNotificationButtonProps) {
  const { isSupported, isConfigured, permission, isLoading, error, requestPermission } =
    usePushNotifications(userId);

  // 브라우저 미지원 시 숨김
  if (!isSupported) {
    return null;
  }

  // Firebase 미설정 시 숨김 (개발 환경에서 편의를 위해)
  // 프로덕션에서는 항상 설정되어 있어야 함
  if (!isConfigured && process.env.NODE_ENV === 'production') {
    return null;
  }

  // 권한 요청 핸들러
  const handleClick = async () => {
    if (permission === 'default' && !isLoading) {
      await requestPermission();
    }
  };

  // 권한 상태별 UI 설정
  const getButtonContent = () => {
    if (isLoading) {
      return {
        icon: <Loader2 size={20} className="animate-spin" />,
        text: '처리 중...',
        ariaLabel: '알림 권한 처리 중',
      };
    }

    switch (permission) {
      case 'granted':
        return {
          icon: <Check size={20} />,
          text: '알림 켜짐',
          ariaLabel: '푸시 알림이 활성화되어 있습니다',
        };
      case 'denied':
        return {
          icon: <BellOff size={20} />,
          text: '알림 차단됨',
          ariaLabel: '브라우저에서 알림이 차단되어 있습니다',
        };
      default:
        return {
          icon: <Bell size={20} />,
          text: '알림 켜기',
          ariaLabel: '푸시 알림 활성화',
        };
    }
  };

  const { icon, text, ariaLabel } = getButtonContent();

  // 버튼 스타일 (권한 상태별)
  const getButtonStyle = () => {
    const baseStyle =
      'inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';

    if (isLoading) {
      return `${baseStyle} bg-gray-100 text-gray-400 cursor-wait dark:bg-gray-700 dark:text-gray-500`;
    }

    switch (permission) {
      case 'granted':
        return `${baseStyle} bg-green-100 text-green-700 cursor-default dark:bg-green-900/30 dark:text-green-400`;
      case 'denied':
        return `${baseStyle} bg-red-100 text-red-700 cursor-not-allowed dark:bg-red-900/30 dark:text-red-400`;
      default:
        return `${baseStyle} bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 focus:ring-brand-500 dark:bg-brand-600 dark:hover:bg-brand-500`;
    }
  };

  // 비활성화 조건
  const isDisabled = permission !== 'default' || isLoading;

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`${getButtonStyle()} ${className}`}
      aria-label={ariaLabel}
      aria-disabled={isDisabled}
      title={error?.message}
    >
      {icon}
      {!compact && <span>{text}</span>}
    </button>
  );
}

export default PushNotificationButton;
