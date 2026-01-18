'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * 페이지 전환 로딩 인디케이터
 *
 * Next.js 라우터 이벤트를 감지하여 페이지 상단에 로딩 바 표시
 */
export function PageLoading() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 라우트 변경 시 로딩 시작
    setIsLoading(true);
    setProgress(30);

    const timer1 = setTimeout(() => setProgress(60), 100);
    const timer2 = setTimeout(() => setProgress(80), 200);
    const timer3 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 200);
    }, 300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [pathname, searchParams]);

  if (!isLoading && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="페이지 로딩 중"
    >
      <div
        className="h-full bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: isLoading ? 1 : 0,
        }}
      />
    </div>
  );
}

export default PageLoading;
