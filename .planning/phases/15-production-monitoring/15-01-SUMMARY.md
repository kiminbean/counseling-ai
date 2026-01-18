---
phase: 15-production-monitoring
plan: 01
status: complete
completed_at: 2026-01-18T20:25:00+09:00
---

# Plan 15-01 Summary: Sentry 에러 트래킹 연동

## Objective
프로덕션 환경에서 에러를 실시간으로 추적하고 디버깅할 수 있도록 Sentry SDK 연동

## Tasks Completed

### Task 1: Install and configure Sentry SDK
- **Commit**: 5e3b6fa
- **Files Modified**:
  - `package.json` - @sentry/nextjs 패키지 추가
  - `sentry.client.config.ts` - 클라이언트 사이드 Sentry 설정
  - `sentry.server.config.ts` - 서버 사이드 Sentry 설정
  - `sentry.edge.config.ts` - Edge 런타임 Sentry 설정
- **Notes**:
  - DSN이 설정된 경우에만 Sentry 초기화
  - 프로덕션 환경에서만 활성화
  - 민감 정보 필터링 (쿼리 파라미터, 헤더)

### Task 2: Update next.config.js for Sentry integration
- **Commit**: ac1823d
- **Files Modified**:
  - `next.config.js` - withSentryConfig 래퍼 적용
  - `.env.local.example` - Sentry 환경 변수 문서화
- **Notes**:
  - DSN이 설정된 경우에만 Sentry 래핑
  - 보안 헤더 코드 리팩토링
  - /monitoring 터널 라우트 설정

### Task 3: Update monitoring.ts to use Sentry
- **Commit**: cbb8953
- **Files Modified**:
  - `lib/monitoring.ts` - Sentry 연동 코드 활성화
- **Notes**:
  - 동적 import로 빌드 시 에러 방지
  - captureError() Sentry 연동
  - setUser() Sentry 사용자 컨텍스트 설정
  - 새 헬퍼 함수 추가: addBreadcrumb, setTag, setContext

## Verification Results
- [x] `npm run build` succeeds without errors
- [x] `npm test` passes all tests (47/47)
- [x] Sentry SDK installed in package.json
- [x] sentry.client.config.ts, sentry.server.config.ts, sentry.edge.config.ts exist
- [x] next.config.js wrapped with withSentryConfig (when DSN set)
- [x] lib/monitoring.ts uses Sentry for production
- [x] .env.local.example has Sentry variables

## Files Modified (Total)
1. `package.json`
2. `package-lock.json`
3. `sentry.client.config.ts` (new)
4. `sentry.server.config.ts` (new)
5. `sentry.edge.config.ts` (new)
6. `next.config.js`
7. `.env.local.example` (new)
8. `lib/monitoring.ts`

## Configuration Guide

### Required Environment Variables
```bash
# Sentry DSN (필수 - Sentry 활성화에 필요)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Source map 업로드용 (선택 - 더 나은 스택 트레이스)
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=sntrys_xxx
```

### Usage in Code
```typescript
import { captureError, setUser, addBreadcrumb } from '@/lib/monitoring';

// 에러 캡처
captureError(new Error('Something went wrong'), {
  page: 'chat',
  action: 'sendMessage',
  userId: 'user123',
});

// 사용자 컨텍스트 설정
setUser('user123');

// 브레드크럼 추가 (에러 컨텍스트)
addBreadcrumb('User clicked send button', 'ui.action');
```

## Notes
- DSN이 설정되지 않으면 콘솔 로깅으로 폴백
- 개발 환경에서는 항상 콘솔 로깅 사용
- 프로덕션에서만 Sentry 활성화
