---
phase: 18-web-vitals
plan: 01
status: completed
completed_at: 2026-01-18
files_created: [lib/webVitals.ts, components/providers/WebVitalsReporter.tsx]
files_modified: [package.json, components/providers/Providers.tsx]
---

# Phase 18-01 Summary: Web Vitals Collection and Reporting

## Objective
Core Web Vitals 수집 및 GA4/콘솔 리포팅 구현

## Completed Tasks

### Task 1: Install web-vitals package
- `npm install web-vitals` 실행
- web-vitals v5.1.0 설치됨
- 검증: `npm ls web-vitals` 확인 완료

### Task 2: Create Web Vitals utility (lib/webVitals.ts)
- **수집 메트릭 (5개)**:
  - LCP (Largest Contentful Paint): 최대 콘텐츠 렌더링
  - INP (Interaction to Next Paint): 상호작용 응답성 (FID 대체)
  - CLS (Cumulative Layout Shift): 레이아웃 안정성
  - FCP (First Contentful Paint): 첫 콘텐츠 렌더링
  - TTFB (Time to First Byte): 서버 응답 시간

- **품질 등급 임계값**:
  | Metric | Good | Poor |
  |--------|------|------|
  | LCP | <= 2.5s | > 4s |
  | INP | <= 200ms | > 500ms |
  | CLS | <= 0.1 | > 0.25 |
  | FCP | <= 1.8s | > 3s |
  | TTFB | <= 800ms | > 1.8s |

- **주요 함수**:
  - `reportWebVitals()`: 메트릭 수집 시작 (동적 import로 코드 스플리팅)
  - `sendToAnalytics()`: GA4 이벤트 전송 (lib/analytics.ts 활용)
  - `logToConsole()`: 개발 모드 포맷팅 출력 (색상 코딩)
  - `getWebVitalsStatus()`: 임계값 정보 조회 (디버깅용)

### Task 3: Integrate Web Vitals reporting
- `WebVitalsReporter` 클라이언트 컴포넌트 생성
- `Providers.tsx`에 통합 (Suspense 내부)
- 앱 로드 시 자동으로 메트릭 수집 시작

## Implementation Details

### 개발 모드 출력 예시
```
[Web Vitals] LCP: 1234ms (good)        # 녹색
  ID: v3-1737166800000-1234567890
  Delta: 1234ms
  Navigation: navigate
```

### GA4 이벤트 구조
```javascript
event('web_vitals', 'performance', 'LCP', 1234, {
  metric_id: 'v3-...',
  metric_rating: 'good',
  metric_delta: 50,
  navigation_type: 'navigate'
})
```

### 기술적 결정
- **web-vitals v5 사용**: FID 대신 INP 사용 (Google 2024년 권장)
- **동적 import**: 초기 번들 크기 최적화
- **품질 등급 색상**: good(녹색), needs-improvement(주황), poor(빨강)

## Verification

- [x] `npm run build` 성공 (오류 없음)
- [x] TypeScript 타입 체크 통과
- [x] 5개 Core Web Vitals 메트릭 수집 구현
- [x] 개발 모드 콘솔 출력 구현
- [x] GA4 이벤트 전송 구현 (analytics.ts 활용)

## Files Changed

### Created
- `/lib/webVitals.ts` - Web Vitals 수집 유틸리티
- `/components/providers/WebVitalsReporter.tsx` - 리포팅 컴포넌트

### Modified
- `/package.json` - web-vitals 의존성 추가
- `/components/providers/Providers.tsx` - WebVitalsReporter 통합

## Notes
- FID(First Input Delay)는 web-vitals v4부터 deprecated, INP로 대체됨
- 프로덕션에서 GA4로 메트릭 전송, 개발 모드에서는 콘솔에 색상 코딩 출력
- Sentry 관련 빌드 경고는 기존 이슈로, 이 phase와 무관함
