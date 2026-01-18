'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { getGAMeasurementId, pageview } from '@/lib/analytics';

/**
 * GA4 Analytics Provider
 *
 * GA4 스크립트를 로드하고 페이지뷰를 자동으로 트래킹합니다.
 * NEXT_PUBLIC_GA_MEASUREMENT_ID 환경 변수가 설정된 경우에만 활성화됩니다.
 */
export function AnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const measurementId = getGAMeasurementId();

  // 라우트 변경 시 페이지뷰 트래킹
  useEffect(() => {
    if (!pathname) return;

    // searchParams를 포함한 전체 URL 생성
    const url = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    pageview(url);
  }, [pathname, searchParams]);

  // Measurement ID가 없으면 스크립트 로드하지 않음
  if (!measurementId) {
    return null;
  }

  return (
    <>
      {/* Google Analytics gtag.js 스크립트 */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      {/* GA4 초기화 스크립트 */}
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
              cookie_flags: 'SameSite=None;Secure'
            });
          `,
        }}
      />
    </>
  );
}
