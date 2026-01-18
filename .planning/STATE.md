# Project State

> Last Updated: 2026-01-18

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-18)

**Core value:** 안정성 + 보안 (특히 에러 처리)
**Current focus:** v2.1 Analytics & Engagement

## Current Status: v2.1 In Progress

| Milestone | Phases | Status |
|-----------|--------|--------|
| v1.2 Production Ready | 1-12 | ✅ Shipped |
| v2.0 Production Complete | 13-16 | ✅ Shipped |
| v2.1 Analytics & Engagement | 17-21 | 🚧 In Progress |

## Current Position

Phase: 17 of 21 (analytics-setup)
Plan: Not started
Status: Ready to plan
Last activity: 2026-01-18 — Milestone v2.1 created

Progress: [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0%

---

## v2.1 Phases

| Phase | Name | Goal | Status |
|-------|------|------|--------|
| 17 | analytics-setup | Google Analytics 4 연동 | Not started |
| 18 | web-vitals | Web Vitals 수집 및 대시보드 | Not started |
| 19 | visual-testing | Visual regression 테스트 | Not started |
| 20 | push-backend | FCM/APNs 서버 연동 | Not started |
| 21 | push-frontend | Service Worker 푸시 핸들링 | Not started |

### Research Flags

| Phase | Research | Topics |
|-------|----------|--------|
| 17 | Likely | GA4 API, gtag.js, Next.js 통합 |
| 18 | Likely | web-vitals library, Vercel Analytics |
| 19 | Likely | Percy, Chromatic, Playwright visual |
| 20 | Likely | Firebase Cloud Messaging, APNs |
| 21 | Unlikely | 기존 Service Worker 확장 |

---

## Accumulated Context

### Key Decisions (v2.0)

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Tailwind darkMode: 'class' | HTML 클래스 기반 다크모드 | ✓ Good |
| sharp 패키지로 아이콘 생성 | 프로그래매틱 아이콘 생성 | ✓ Good |
| Sentry 선택적 초기화 | DSN 없으면 비활성화 | ✓ Good |
| Playwright E2E 테스트 | 56개 테스트로 핵심 플로우 커버 | ✓ Good |

### Key Decisions (v1.2)

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 익명 토큰 인증 | 회원가입 없이 즉시 사용 가능 | ✓ Good |
| localStorage 세션 저장 | 서버 부하 감소, 빠른 로딩 | ✓ Good |
| PWA 지원 | 모바일 앱 느낌, 오프라인 지원 | ✓ Good |
| Vitest 테스트 | Jest보다 빠른 실행 속도 | ✓ Good |

---

## Session Continuity

Last session: 2026-01-18
Stopped at: Milestone v2.1 initialization
Resume file: None

### Roadmap Evolution

- v2.1 Analytics & Engagement created: 분석/모니터링/푸시알림, 5 phases (Phase 17-21)

---

## Verification Commands

```bash
# 단위 테스트 실행 (47개)
npm test

# E2E 테스트 실행 (56개)
npm run test:e2e

# 빌드 확인
npm run build

# 개발 서버
npm run dev
```

---

*Milestone v1.2 archived: .planning/milestones/v1.2-ROADMAP.md*
