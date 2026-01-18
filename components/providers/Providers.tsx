'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * 앱 전역 Provider 래퍼
 * - ErrorBoundary: 에러 포착 및 fallback UI
 * - AuthProvider: 인증 상태 관리
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ErrorBoundary>
  );
}
