# MindBridge AI Frontend

> AI 기반 한국어 심리상담 챗봇의 프론트엔드

## Overview

| 항목 | 내용 |
|------|------|
| 프로젝트 유형 | 웹 프론트엔드 (Next.js 14 App Router) |
| 목표 | 상용화 수준의 프로덕션 프론트엔드 완성 |
| 핵심 가치 | 안정성 + 보안 (특히 에러 처리) |
| 대상 사용자 | 한국어 사용자 (심리상담 필요) |

## Current State (v2.0)

**Shipped:** 2026-01-18

| Metric | Value |
|--------|-------|
| TypeScript Files | 60+ |
| Lines of Code | 7,583 |
| Unit Tests | 47 passing |
| E2E Tests | 56 passing |
| Total Tests | 103 |
| Build | Production ready |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library + Playwright (E2E)
- **Monitoring**: Sentry (error tracking)
- **Backend**: FastAPI (port 8000)

## Core Features

1. **익명 채팅 상담**
   - 자동 익명 인증 (anonymous token)
   - 실시간 AI 응답
   - 세션 영속성 (localStorage)

2. **감정 분석**
   - AI 기반 감정 감지
   - 시각적 감정 배지 표시
   - 위기 상황 자동 알림

3. **기분 체크인**
   - 일일 기분 기록
   - 트리거 및 활동 추적
   - 히스토리 조회

4. **안전 기능**
   - 위기 상담 전화번호 안내 (1393, 1577-0199)
   - CrisisAlert 모달
   - 자동 위기 감지

## Requirements

### Validated (v1.2)

- ✓ Error Boundary로 모든 페이지 래핑 — v1.0
- ✓ API 호출 실패 시 우아한 폴백 — v1.0
- ✓ 오프라인 상태 감지 및 알림 — v1.0
- ✓ 테스트 커버리지 47 테스트 — v1.0
- ✓ 토큰 암호화 저장 (secureStorage) — v1.0
- ✓ CSRF 보호 — v1.0
- ✓ Security headers (CSP, XSS, HSTS) — v1.0
- ✓ 입력 검증 — v1.0
- ✓ 모바일/데스크톱 반응형 — v1.0
- ✓ 로딩 상태 표시 — v1.0
- ✓ 에러 메시지 사용자 친화적 — v1.0
- ✓ 접근성 (SkipLink, FocusTrap, ARIA) — v1.1
- ✓ 성능 최적화 (debounce, memo) — v1.1
- ✓ 애니메이션/피드백 — v1.1
- ✓ PWA 지원 (Service Worker, manifest) — v1.2
- ✓ 모니터링 준비 (captureError, metrics) — v1.2

### Validated (v2.0)

- ✓ /settings 페이지 구현 (테마, 알림, 개인정보 관리) — v2.0
- ✓ /privacy 페이지 구현 (한국어 개인정보 처리방침) — v2.0
- ✓ /help 페이지 구현 (FAQ 아코디언, 긴급 연락처) — v2.0
- ✓ PWA 아이콘 생성 (8개 사이즈, Apple Touch, favicon) — v2.0
- ✓ Sentry 연동 (선택적 초기화, DSN 없으면 폴백) — v2.0
- ✓ E2E 테스트 (Playwright 56개 테스트) — v2.0
- ✓ 다크 모드 지원 (ThemeContext, light/dark/system) — v2.0
- ✓ GitHub Actions CI (E2E 자동화) — v2.0

### Active (v2.1 - Future)

- [ ] Google Analytics 연동
- [ ] Web Vitals 대시보드
- [ ] Visual regression 테스트
- [ ] 푸시 알림 구현 (현재 UI만 존재)
- [ ] 앱 스토어 메타데이터 작성

### Out of Scope (v1/v2 범위 외)

- 다국어 지원 (한국어 전용)
- 실시간 알림 (Push)
- 상담사 연결
- 결제 시스템
- 소셜 로그인

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 익명 토큰 인증 | 회원가입 없이 즉시 사용 가능 | ✓ Good |
| localStorage 세션 저장 | 서버 부하 감소, 빠른 로딩 | ✓ Good |
| Sentry 선택적 의존성 | 개발 환경에서 불필요한 의존성 제거 | ✓ Good |
| PWA 지원 | 모바일 앱 느낌, 오프라인 지원 | ✓ Good |
| Vitest 테스트 | Jest보다 빠른 실행 속도 | ✓ Good |
| Tailwind darkMode: 'class' | HTML 클래스 기반 다크모드, SSR 호환 | ✓ Good |
| sharp로 아이콘 생성 | 프로그래매틱 아이콘 생성, 재현 가능 | ✓ Good |
| Playwright E2E | Cypress보다 빠르고 Next.js 통합 좋음 | ✓ Good |

## Key Constraints

1. **백엔드 의존성**: FastAPI 서버 (port 8000) 필수
2. **인증 방식**: 익명 토큰 (JWT)
3. **데이터 저장**: 클라이언트 localStorage + 서버 세션
4. **브라우저 지원**: Chrome, Safari, Edge (최신 2버전)

## Architecture

```
app/
├── layout.tsx          # Root layout (Providers 래핑)
├── page.tsx            # 채팅 메인
├── checkin/page.tsx    # 기분 체크인
├── exercises/page.tsx  # 심리 운동
└── profile/page.tsx    # 프로필

components/
├── chat/               # 채팅 관련 컴포넌트
├── common/             # 공통 컴포넌트 (Avatar, Skeleton, ErrorBoundary)
├── layout/             # 레이아웃 (AppShell, BottomNav)
└── providers/          # Context Providers

hooks/                  # 커스텀 훅 (useChat, useLocalStorage, useFocusTrap, usePWA)
contexts/               # React Context (AuthContext)
lib/                    # 유틸리티 (api, constants, security, monitoring, utils)
```

---
*Last updated: 2026-01-18 after v2.0 milestone*
