'use client';

import { ReactNode, Suspense } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { OfflineAlert } from '@/components/common/OfflineAlert';
import { ToastProvider } from '@/components/common/Toast';
import { PageLoading } from '@/components/common/PageLoading';
import { InstallPrompt } from '@/components/common/InstallPrompt';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * 앱 전역 Provider 래퍼
 * - ErrorBoundary: 에러 포착 및 fallback UI
 * - AuthProvider: 인증 상태 관리
 * - ToastProvider: 알림 토스트 시스템
 * - OfflineAlert: 오프라인 상태 알림
 * - PageLoading: 페이지 전환 로딩 표시
 * - InstallPrompt: PWA 설치 프롬프트
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <Suspense fallback={null}>
            <PageLoading />
          </Suspense>
          <OfflineAlert />
          {children}
          <InstallPrompt />
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
