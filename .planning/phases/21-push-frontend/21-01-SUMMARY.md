---
phase: 21-push-frontend
plan: 01
type: summary
completed_at: 2026-01-18
status: complete
---

# Phase 21-01 Summary: Service Worker Push Handling & Notification Settings UI

## Objective Achieved
Service Worker 푸시 핸들링 및 알림 설정 UI 구현 완료

## Files Created/Modified

### 1. Created: `public/firebase-messaging-sw.js`
Firebase Cloud Messaging Service Worker for background push notifications.

**Features:**
- Firebase compat SDK (v10.7.0) for Service Worker environment
- Background message handler (`onBackgroundMessage`)
- Notification click handler with app focus/navigation
- Notification close handler for analytics
- Placeholder Firebase config (users replace with their values)
- Notification actions (open/close buttons)
- Vibration pattern support

**Configuration Note:**
Service Workers cannot access environment variables. Users must:
1. Replace placeholder values with actual Firebase config
2. Or use build script to inject environment variables at build time

### 2. Created: `components/common/PushNotificationButton.tsx`
React client component for push notification permission management.

**Features:**
- Uses `usePushNotifications` hook from Phase 20
- Browser support detection (hides if unsupported)
- Firebase configuration check
- Permission state-based UI:
  - `default`: "알림 켜기" button with Bell icon (clickable)
  - `granted`: "알림 켜짐" with Check icon (green, disabled)
  - `denied`: "알림 차단됨" with BellOff icon (red, disabled)
- Loading state with Loader2 spinner
- Error handling via title tooltip
- Optional `compact` mode (icon only)
- Dark mode support via Tailwind classes
- Lucide React icons (Bell, BellOff, Check, Loader2)

**Props:**
```typescript
interface PushNotificationButtonProps {
  className?: string;  // Additional CSS classes
  userId?: string;     // User ID for token storage
  compact?: boolean;   // Icon-only mode
}
```

### 3. Modified: `app/settings/page.tsx`
Integrated push notification UI into the settings page.

**Changes:**
- Added imports for `usePushNotifications` hook and `PushNotificationButton`
- Added `isPushSupported` and `pushPermission` state
- Created new "브라우저 푸시 알림" section with:
  - Status icon (green/red/brand color based on permission)
  - Description text
  - `PushNotificationButton` component
  - Permission status messages:
    - `denied`: "브라우저 설정에서 알림 권한을 허용해주세요."
    - `granted`: "푸시 알림이 활성화되었습니다."
- Renamed existing toggle to "인앱 알림" for clarity
- Maintained existing localStorage-based notification preferences

### 4. Fixed: `lib/webVitals.ts` (bonus fix)
Fixed pre-existing type errors caused by web-vitals v4 breaking changes.

**Changes:**
- Removed `FIDMetric` type import (deprecated in v4)
- Removed `onFID` function call (deprecated in v4)
- Updated comments to reflect FID -> INP transition

## Verification

### Build Verification
```bash
npm run build
# ✓ Compiled successfully
# ✓ All pages generated (10/10)
# Route /settings: 5.48 kB / 121 kB First Load JS
```

### Checklist
- [x] `npm run build` 오류 없음
- [x] `firebase-messaging-sw.js` 존재
- [x] `PushNotificationButton.tsx` TypeScript 컴파일 완료
- [x] 설정 페이지에 푸시 알림 UI 통합됨
- [x] 권한 상태별 UI 렌더링 구현

## Architecture Notes

### Push Notification Flow
```
┌─────────────────────────────────────────────────────────────┐
│                     Settings Page                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  PushNotificationButton                                 │ │
│  │  └── usePushNotifications hook                          │ │
│  │       └── pushNotifications.ts                          │ │
│  │            └── Firebase SDK (getToken, onMessage)       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               firebase-messaging-sw.js                       │
│  - Background message handling                               │
│  - Notification display                                      │
│  - Click handling (app focus/open)                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Firebase Cloud Messaging                      │
│  - Push message delivery                                     │
│  - Token management                                          │
└─────────────────────────────────────────────────────────────┘
```

### Service Worker Files
The project now has two Service Workers:
1. `public/sw.js` - PWA caching and offline support
2. `public/firebase-messaging-sw.js` - FCM background messages

Both work independently without conflicts.

## Dependencies
- Phase 20 (push-backend): `lib/pushNotifications.ts`, `hooks/usePushNotifications.ts`
- Firebase SDK: Already installed in Phase 20
- Lucide React: Already installed

## Next Steps
1. Configure Firebase project and update Service Worker config
2. Set VAPID key environment variable (`NEXT_PUBLIC_FIREBASE_VAPID_KEY`)
3. Test push notification flow end-to-end
4. (Optional) Add build script to inject Firebase config into SW

## Notes
- The Service Worker uses Firebase compat SDK (not modular) as required for SW environment
- Notification permissions are persistent across sessions (browser stores them)
- The settings page now shows both browser push and in-app notification toggles
