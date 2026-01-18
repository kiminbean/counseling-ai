'use client';

import { useState, useEffect } from 'react';

/**
 * 미디어 쿼리 매칭 여부를 반환하는 훅
 * @param query - CSS 미디어 쿼리 문자열 (예: "(min-width: 1024px)")
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // 이벤트 리스너 등록
    mediaQuery.addEventListener('change', handler);

    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
}

// 자주 사용되는 브레이크포인트 훅들
export function useIsMobile() {
  return !useMediaQuery('(min-width: 640px)');
}

export function useIsTablet() {
  return useMediaQuery('(min-width: 640px)') && !useMediaQuery('(min-width: 1024px)');
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)');
}
