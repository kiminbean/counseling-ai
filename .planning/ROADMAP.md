# Roadmap: MindBridge AI Frontend

> 상용화 수준 프론트엔드 완성을 위한 로드맵

## Milestones

- ✅ **v1.2 Production Ready** — Phases 1-12 (shipped 2026-01-18) → [Archive](milestones/v1.2-ROADMAP.md)
- ✅ **v2.0 Production Complete** — Phases 13-16 (shipped 2026-01-18) → [Archive](milestones/v2.0-ROADMAP.md)
- 🚧 **v2.1 Analytics & Engagement** — Phases 17-21 (in progress)

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

### 🚧 v2.1 Analytics & Engagement (In Progress)

**Milestone Goal:** 분석, 모니터링, 사용자 참여 기능 강화

#### Phase 17: analytics-setup

**Goal**: Google Analytics 4 연동 및 이벤트 트래킹
**Depends on**: v2.0 milestone complete
**Research**: Likely (GA4 API, gtag.js)
**Research topics**: GA4 설정, Next.js 통합 패턴, 이벤트 스키마 설계
**Plans**: TBD

Plans:
- [ ] 17-01: TBD (run /gsd:plan-phase 17 to break down)

#### Phase 18: web-vitals

**Goal**: Web Vitals 수집 및 성능 대시보드
**Depends on**: Phase 17
**Research**: Likely (web-vitals library, Vercel Analytics)
**Research topics**: Core Web Vitals 메트릭, 리포팅 패턴
**Plans**: TBD

Plans:
- [ ] 18-01: TBD

#### Phase 19: visual-testing

**Goal**: Visual regression 테스트 자동화
**Depends on**: Phase 18
**Research**: Likely (Percy, Chromatic, Playwright visual)
**Research topics**: Visual testing 도구 비교, CI 통합
**Plans**: TBD

Plans:
- [ ] 19-01: TBD

#### Phase 20: push-backend

**Goal**: FCM/APNs 서버 연동 및 토큰 관리
**Depends on**: Phase 19
**Research**: Likely (Firebase Cloud Messaging, APNs)
**Research topics**: FCM 설정, 토큰 저장, 백엔드 API
**Plans**: TBD

Plans:
- [ ] 20-01: TBD

#### Phase 21: push-frontend

**Goal**: Service Worker 푸시 핸들링 및 UI
**Depends on**: Phase 20
**Research**: Unlikely (기존 Service Worker 확장)
**Plans**: TBD

Plans:
- [ ] 21-01: TBD

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-12 | v1.2 | All | ✅ Complete | 2026-01-18 |
| 13. pages-implementation | v2.0 | 2/2 | ✅ Complete | 2026-01-18 |
| 14. pwa-completion | v2.0 | 1/1 | ✅ Complete | 2026-01-18 |
| 15. production-monitoring | v2.0 | 1/1 | ✅ Complete | 2026-01-18 |
| 16. e2e-testing | v2.0 | 1/1 | ✅ Complete | 2026-01-18 |
| 17. analytics-setup | v2.1 | 0/? | Not started | - |
| 18. web-vitals | v2.1 | 0/? | Not started | - |
| 19. visual-testing | v2.1 | 0/? | Not started | - |
| 20. push-backend | v2.1 | 0/? | Not started | - |
| 21. push-frontend | v2.1 | 0/? | Not started | - |
