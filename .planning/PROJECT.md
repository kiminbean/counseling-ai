# MindBridge AI Frontend

> AI 기반 한국어 심리상담 챗봇의 프론트엔드

## Overview

| 항목 | 내용 |
|------|------|
| 프로젝트 유형 | 웹 프론트엔드 (Next.js 14 App Router) |
| 목표 | 상용화 수준의 프로덕션 프론트엔드 완성 |
| 핵심 가치 | 안정성 + 보안 (특히 에러 처리) |
| 대상 사용자 | 한국어 사용자 (심리상담 필요) |

## Current State (v1.2)

**Shipped:** 2026-01-18

| Metric | Value |
|--------|-------|
| TypeScript Files | 47 |
| Lines of Code | 5,618 |
| Tests | 47 passing |
| Build | Production ready |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library
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

### Active (v2.0)

- [ ] /settings 페이지 구현
- [ ] /privacy 페이지 구현
- [ ] /help 페이지 구현
- [ ] PWA 아이콘 생성 (72x72 ~ 512x512)
- [ ] Sentry 연동 (에러 트래킹)
- [ ] E2E 테스트 (Playwright)
- [ ] 다크 모드 지원

### Out of Scope (v1 범위 외)

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
*Last updated: 2026-01-18 after v1.2 milestone*
