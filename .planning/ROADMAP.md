# Roadmap: MindBridge AI Frontend

> 상용화 수준 프론트엔드 완성을 위한 로드맵

## Milestones

- ✅ **v1.2 Production Ready** — Phases 1-12 (shipped 2026-01-18) → [Archive](milestones/v1.2-ROADMAP.md)
- ✅ **v2.0 Production Complete** — Phases 13-16 (shipped 2026-01-18) → [Archive](milestones/v2.0-ROADMAP.md)
- ✅ **v2.1 Analytics & Engagement** — Phases 17-21 (completed 2026-01-18)

## Completed Milestones

<details>
<summary>✅ v1.2 Production Ready (Phases 1-12) — SHIPPED 2026-01-18</summary>

### Milestone 1: 상용화 기반 (Phases 1-7)

| Phase | 내용 | 상태 |
|-------|------|------|
| 1 | 인증 및 세션 | Done |
| 2 | 모바일 반응형 레이아웃 | Done |
| 3 | 채팅 UI 현대화 | Done |
| 4 | 공통 컴포넌트 | Done |
| 5 | 보안 강화 | Done |
| 6 | 테스트 인프라 | Done |
| 7 | 안정성 개선 | Done |

### Milestone 2: UX 완성 (Phases 8-10)

| Phase | 내용 | 상태 |
|-------|------|------|
| 8 | 접근성 개선 | Done |
| 9 | 성능 최적화 | Done |
| 10 | 애니메이션 및 피드백 | Done |

### Milestone 3: 확장 기능 (Phases 11-12)

| Phase | 내용 | 상태 |
|-------|------|------|
| 11 | PWA 지원 | Done |
| 12 | 모니터링 | Done |

</details>

<details>
<summary>✅ v2.0 Production Complete (Phases 13-16) — SHIPPED 2026-01-18</summary>

**Milestone Goal:** 사용자 경험 완성 및 운영 준비

### Phase 13: pages-implementation ✅

**Goal**: 미구현 페이지 완성 (/settings, /privacy, /help)

Plans:
- [x] 13-01: ThemeContext, useTheme hook, /settings 페이지
- [x] 13-02: /privacy, /help 페이지

### Phase 14: pwa-completion ✅

**Goal**: PWA 아이콘 생성 및 앱 스토어 배포 준비

Plans:
- [x] 14-01: PWA 아이콘 8개 사이즈, Apple Touch Icon, favicon

### Phase 15: production-monitoring ✅

**Goal**: Sentry 에러 트래킹 연동

Plans:
- [x] 15-01: @sentry/nextjs 설치 및 설정

### Phase 16: e2e-testing ✅

**Goal**: Playwright로 핵심 시나리오 자동화

Plans:
- [x] 16-01: Playwright 설정, 56개 E2E 테스트

</details>

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-12 | v1.2 | All | ✅ Complete | 2026-01-18 |
| 13. pages-implementation | v2.0 | 2/2 | ✅ Complete | 2026-01-18 |
| 14. pwa-completion | v2.0 | 1/1 | ✅ Complete | 2026-01-18 |
| 15. production-monitoring | v2.0 | 1/1 | ✅ Complete | 2026-01-18 |
| 16. e2e-testing | v2.0 | 1/1 | ✅ Complete | 2026-01-18 |

---

### ✅ v2.1 Analytics & Engagement (COMPLETE)

**Milestone Goal:** 분석, 모니터링, 사용자 참여 기능 강화

#### Phase 17: analytics-setup ✅

**Goal**: Google Analytics 4 연동 및 이벤트 트래킹

Plans:
- [x] 17-01: GA4 analytics utility, AnalyticsProvider, ANALYTICS_EVENTS 상수

**Deliverables:**
- `lib/analytics.ts` - GA4 유틸리티 (pageview, event, 헬퍼 함수)
- `components/providers/AnalyticsProvider.tsx` - GA4 스크립트 로더
- `lib/constants.ts` - 22개 ANALYTICS_EVENTS 상수

#### Phase 18: web-vitals ✅

**Goal**: Web Vitals 수집 및 GA4 리포팅

Plans:
- [x] 18-01: web-vitals 라이브러리, WebVitalsReporter 컴포넌트

**Deliverables:**
- `lib/webVitals.ts` - Core Web Vitals 수집 (LCP, INP, CLS, FCP, TTFB)
- `components/providers/WebVitalsReporter.tsx` - 자동 메트릭 리포팅

#### Phase 19: visual-testing ✅

**Goal**: Visual regression 테스트 자동화

Plans:
- [x] 19-01: Playwright visual config, visual.spec.ts (17개 테스트)

**Deliverables:**
- `playwright.config.ts` - Visual 테스트 설정 추가
- `e2e/visual.spec.ts` - 17개 시각적 회귀 테스트
- npm scripts: `test:visual`, `test:visual:update`

#### Phase 20: push-backend ✅

**Goal**: FCM 클라이언트 연동 및 토큰 관리

Plans:
- [x] 20-01: Firebase SDK, pushNotifications.ts, usePushNotifications hook

**Deliverables:**
- `lib/pushNotifications.ts` - FCM 초기화, 토큰 관리
- `hooks/usePushNotifications.ts` - React hook

#### Phase 21: push-frontend ✅

**Goal**: Service Worker 푸시 핸들링 및 UI

Plans:
- [x] 21-01: firebase-messaging-sw.js, PushNotificationButton, 설정 페이지 통합

**Deliverables:**
- `public/firebase-messaging-sw.js` - 백그라운드 푸시 핸들러
- `components/common/PushNotificationButton.tsx` - 알림 권한 버튼
- `app/settings/page.tsx` - 푸시 알림 UI 통합

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-12 | v1.2 | All | ✅ Complete | 2026-01-18 |
| 13. pages-implementation | v2.0 | 2/2 | ✅ Complete | 2026-01-18 |
| 14. pwa-completion | v2.0 | 1/1 | ✅ Complete | 2026-01-18 |
| 15. production-monitoring | v2.0 | 1/1 | ✅ Complete | 2026-01-18 |
| 16. e2e-testing | v2.0 | 1/1 | ✅ Complete | 2026-01-18 |
| 17. analytics-setup | v2.1 | 1/1 | ✅ Complete | 2026-01-18 |
| 18. web-vitals | v2.1 | 1/1 | ✅ Complete | 2026-01-18 |
| 19. visual-testing | v2.1 | 1/1 | ✅ Complete | 2026-01-18 |
| 20. push-backend | v2.1 | 1/1 | ✅ Complete | 2026-01-18 |
| 21. push-frontend | v2.1 | 1/1 | ✅ Complete | 2026-01-18 |
