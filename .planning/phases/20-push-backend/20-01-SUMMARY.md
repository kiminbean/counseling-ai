---
phase: 20-push-backend
plan: 01
status: completed
completed_at: 2025-01-18
---

# Phase 20-01: FCM Client Integration Summary

## Overview
Firebase Cloud Messaging (FCM) 클라이언트 연동 완료. 푸시 알림을 위한 토큰 관리 및 권한 요청 기능 구현.

## What Was Implemented

### 1. Firebase SDK Installation
- **Package**: `firebase@12.8.0`
- Modular SDK v9+ (tree-shakeable)

### 2. Push Notification Utilities (`lib/pushNotifications.ts`)
FCM 관리를 위한 유틸리티 함수들:

| Function | Description |
|----------|-------------|
| `isFirebaseConfigured()` | Firebase 환경 변수 설정 여부 확인 |
| `isPushSupported()` | 브라우저 Push API 지원 여부 확인 |
| `initializeFirebaseMessaging()` | Firebase Messaging 싱글톤 초기화 |
| `requestNotificationPermission()` | 알림 권한 요청 |
| `getNotificationPermission()` | 현재 권한 상태 조회 |
| `getFCMToken()` | FCM 토큰 획득 |
| `getCachedToken()` | localStorage에서 캐시된 토큰 조회 |
| `isTokenRefreshNeeded()` | 토큰 갱신 필요 여부 확인 (7일 주기) |
| `clearCachedToken()` | 캐시된 토큰 삭제 |
| `onMessageReceived(callback)` | 포그라운드 메시지 수신 핸들러 등록 |
| `saveFCMTokenToServer(token, userId?)` | 서버에 토큰 저장 |
| `removeFCMTokenFromServer(token)` | 서버에서 토큰 삭제 |
| `initializePushNotifications(userId?)` | 전체 초기화 (권한 -> 토큰 -> 서버 저장) |

### 3. React Hook (`hooks/usePushNotifications.ts`)
상태 관리 및 편의 기능 제공:

```typescript
interface UsePushNotificationsReturn {
  isSupported: boolean;       // 브라우저 지원 여부
  isConfigured: boolean;      // Firebase 설정 여부
  permission: NotificationPermission;  // 'default' | 'granted' | 'denied'
  token: string | null;       // FCM 토큰
  isLoading: boolean;         // 초기화 중
  error: Error | null;        // 에러 상태
  requestPermission(): Promise<boolean>;  // 권한 요청 함수
  subscribe(callback): () => void;        // 메시지 구독
}
```

## Files Created/Modified

| File | Action |
|------|--------|
| `package.json` | Firebase dependency 추가 |
| `lib/pushNotifications.ts` | **Created** - FCM 유틸리티 |
| `hooks/usePushNotifications.ts` | **Created** - React Hook |
| `hooks/index.ts` | **Modified** - Export 추가 |

## Environment Variables Required

Firebase 콘솔에서 설정 후 `.env.local`에 추가:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key
```

**참고**: 환경 변수 없이도 빌드가 성공하며, 푸시 알림만 비활성화됩니다.

## How to Test

### 1. 브라우저 지원 확인
```typescript
import { usePushNotifications } from '@/hooks';

function TestComponent() {
  const { isSupported, isConfigured } = usePushNotifications();
  console.log('Push supported:', isSupported);
  console.log('Firebase configured:', isConfigured);
}
```

### 2. 권한 요청 테스트
```typescript
function NotificationButton() {
  const { permission, requestPermission } = usePushNotifications();

  return (
    <button
      onClick={requestPermission}
      disabled={permission === 'denied'}
    >
      {permission === 'granted' ? '알림 켜짐' : '알림 켜기'}
    </button>
  );
}
```

### 3. 빌드 테스트
```bash
npm run build  # 오류 없이 완료 확인
```

## Verification Checklist

- [x] `npm run build` 오류 없음
- [x] Firebase 환경 변수 없이도 빌드 성공
- [x] TypeScript 타입 오류 없음
- [x] SSR 환경 안전 (window/navigator 체크)
- [x] 알림 권한 거부 시 graceful 처리

## API Endpoints (Backend Required)

토큰 서버 저장을 위해 백엔드에서 구현 필요:

```
POST /api/v3/push/register
Body: { token: string, platform: 'web', user_id?: string }

POST /api/v3/push/unregister
Body: { token: string }
```

## Next Steps

1. **Phase 20-02**: Service Worker에 firebase-messaging-sw.js 연동 (백그라운드 알림)
2. **Backend**: 푸시 토큰 저장/관리 API 구현
3. **UI**: 설정 페이지에 알림 토글 추가
