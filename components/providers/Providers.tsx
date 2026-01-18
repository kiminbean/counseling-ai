'use client';

import { ReactNode, Suspense } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { OfflineAlert } from '@/components/common/OfflineAlert';
import { ToastProvider } from '@/components/common/Toast';
import { PageLoading } from '@/components/common/PageLoading';
import { InstallPrompt } from '@/components/common/InstallPrompt';
import { AnalyticsProvider } from '@/components/providers/AnalyticsProvider';
import { WebVitalsReporter } from '@/components/providers/WebVitalsReporter';

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
 * - AnalyticsProvider: GA4 분석 트래킹
 * - WebVitalsReporter: Core Web Vitals 성능 모니터링
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <ThemeProvider>
            <Suspense fallback={null}>
              <PageLoading />
              <AnalyticsProvider />
              <WebVitalsReporter />
            </Suspense>
            <OfflineAlert />
            {children}
            <InstallPrompt />
          </ThemeProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
