# Roadmap: MindBridge AI Frontend

> 상용화 수준 프론트엔드 완성을 위한 로드맵

## Milestones

- ✅ **v1.2 Production Ready** — Phases 1-12 (shipped 2026-01-18) → [Archive](milestones/v1.2-ROADMAP.md)
- 🚧 **v2.0 Production Complete** — Phases 13-16 (in progress)

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

---

## 🚧 v2.0 Production Complete (In Progress)

**Milestone Goal:** 사용자 경험 완성 및 운영 준비 - 미구현 페이지 완성, PWA 아이콘, 프로덕션 모니터링, E2E 테스트

### Phase 13: pages-implementation

**Goal**: 미구현 페이지 완성 (/settings, /privacy, /help)
**Depends on**: v1.2 milestone complete
**Research**: Unlikely (internal patterns, reusing existing components)
**Plans**: TBD

Tasks:
- /settings 페이지: 알림 설정, 테마 설정(다크모드), 개인정보 관리(데이터 삭제/내보내기), PWA 설치 안내
- /privacy 페이지: 개인정보 처리방침
- /help 페이지: 사용 가이드, FAQ, 문의하기

Plans:
- [ ] 13-01: TBD (run /gsd:plan-phase 13 to break down)

### Phase 14: pwa-completion

**Goal**: PWA 아이콘 생성 및 앱 스토어 배포 준비
**Depends on**: Phase 13
**Research**: Unlikely (asset generation only)
**Plans**: TBD

Tasks:
- 72x72 ~ 512x512 아이콘 생성
- Apple Touch Icon
- 앱 스토어 메타데이터 준비

Plans:
- [ ] 14-01: TBD

### Phase 15: production-monitoring

**Goal**: Sentry 연동, Analytics, 성능 대시보드
**Depends on**: Phase 14
**Research**: Likely (Sentry/Analytics integration)
**Research topics**: @sentry/nextjs 설정, Google Analytics 4 연동, Web Vitals 대시보드 구현
**Plans**: TBD

Tasks:
- Sentry 에러 트래킹 활성화 (npm install @sentry/nextjs)
- Google Analytics 연동
- Web Vitals 대시보드

Plans:
- [ ] 15-01: TBD

### Phase 16: e2e-testing

**Goal**: Playwright로 핵심 시나리오 자동화
**Depends on**: Phase 15
**Research**: Likely (Playwright setup with Next.js)
**Research topics**: Playwright 설정, Next.js 테스트 패턴, CI/CD 연동
**Plans**: TBD

Tasks:
- Playwright 설정
- 채팅 플로우 테스트
- 인증 플로우 테스트
- 오프라인 동작 테스트

Plans:
- [ ] 16-01: TBD

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-12 | v1.2 | All | ✅ Complete | 2026-01-18 |
| 13. pages-implementation | v2.0 | 0/? | Not started | - |
| 14. pwa-completion | v2.0 | 0/? | Not started | - |
| 15. production-monitoring | v2.0 | 0/? | Not started | - |
| 16. e2e-testing | v2.0 | 0/? | Not started | - |
