'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { captureError } from '@/lib/monitoring';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary 컴포넌트
 * React 컴포넌트 트리에서 발생하는 에러를 포착하고 fallback UI를 표시
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 에러 모니터링 서비스로 전송
    captureError(error, {
      page: typeof window !== 'undefined' ? window.location.pathname : undefined,
      action: 'component_error',
      extra: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle size={32} className="text-red-500" />
            </div>

            <h1 className="text-xl font-bold text-gray-800 mb-2">
              문제가 발생했습니다
            </h1>

            <p className="text-gray-500 mb-6">
              일시적인 오류가 발생했습니다.
              페이지를 새로고침하거나 잠시 후 다시 시도해 주세요.
            </p>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left overflow-auto max-h-32">
                <p className="text-xs font-mono text-red-600">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
              >
                <RefreshCw size={18} />
                다시 시도
              </button>

              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Home size={18} />
                홈으로
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
                긴급 상황 시{' '}
                <a href="tel:1393" className="font-semibold underline">1393</a>
                (자살예방) 또는{' '}
                <a href="tel:1577-0199" className="font-semibold underline">1577-0199</a>
                (정신건강)로 연락하세요.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 페이지 레벨 Error Boundary 래퍼
 */
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
