# Phase 17-01: Google Analytics 4 Integration Summary

## Completion Status: COMPLETED

---

## What Was Implemented

### 1. GA4 Analytics Utility Module (`lib/analytics.ts`)
- **Core Functions:**
  - `pageview(url, title?)` - 페이지뷰 트래킹
  - `event(action, category, label?, value?, additionalParams?)` - 이벤트 트래킹
  - `setUserProperties(properties)` - 익명 사용자 속성 설정
  - `setUserId(userId)` - 익명화된 사용자 ID 설정

- **Specialized Helper Functions:**
  - `trackChatMessage()` - 채팅 메시지 전송 추적
  - `trackMoodCheckin(moodCategory)` - 기분 체크인 완료 추적
  - `trackExerciseStart(exerciseType)` - 운동/활동 시작 추적
  - `trackExerciseComplete(exerciseType, durationSeconds?)` - 운동/활동 완료 추적
  - `trackCrisisHotlineShown()` - 위기 핫라인 표시 추적 (안전 메트릭)
  - `trackCrisisHotlineClick(hotlineType)` - 위기 핫라인 클릭 추적
  - `trackError(errorCategory, errorCode?)` - 에러 추적
  - `trackFeatureUsage(featureName, action)` - 기능 사용 추적

- **Utility Functions:**
  - `isAnalyticsReady()` - GA4 스크립트 로드 상태 확인
  - `getGAMeasurementId()` - Measurement ID 반환

### 2. Analytics Provider Component (`components/providers/AnalyticsProvider.tsx`)
- Next.js App Router와 호환되는 GA4 스크립트 로더
- `next/script`를 사용한 `afterInteractive` 전략으로 성능 최적화
- `usePathname` + `useSearchParams`로 라우트 변경 자동 감지 및 페이지뷰 전송
- 환경 변수 조건부 렌더링 (NEXT_PUBLIC_GA_MEASUREMENT_ID 필요)
- IP 익명화 (`anonymize_ip: true`) 기본 활성화

### 3. ANALYTICS_EVENTS Constants (`lib/constants.ts`)
- 22개의 표준화된 분석 이벤트 정의:
  - 채팅: `CHAT_MESSAGE_SENT`
  - 기분 체크인: `MOOD_CHECKIN_STARTED`, `MOOD_CHECKIN_COMPLETED`
  - 운동/활동: `EXERCISE_STARTED`, `EXERCISE_COMPLETED`, `EXERCISE_PAUSED`, `EXERCISE_RESUMED`
  - 위기 대응: `CRISIS_HOTLINE_SHOWN`, `CRISIS_HOTLINE_CLICKED`, `CRISIS_ALERT_SHOWN`
  - 기능 사용: `FEATURE_DARK_MODE_TOGGLED`, `FEATURE_NOTIFICATIONS_TOGGLED`
  - 네비게이션: `NAV_SIDEBAR_OPENED`, `NAV_TAB_CLICKED`
  - 에러: `ERROR_API`, `ERROR_NETWORK`
  - PWA: `PWA_INSTALL_PROMPTED`, `PWA_INSTALLED`, `PWA_INSTALL_DISMISSED`

---

## Files Created

| File | Description |
|------|-------------|
| `lib/analytics.ts` | GA4 분석 유틸리티 모듈 |
| `components/providers/AnalyticsProvider.tsx` | GA4 스크립트 로더 및 페이지뷰 트래커 |

## Files Modified

| File | Changes |
|------|---------|
| `components/providers/Providers.tsx` | AnalyticsProvider 추가 |
| `lib/constants.ts` | ANALYTICS_EVENTS 상수 추가 |
| `.env.local.example` | NEXT_PUBLIC_GA_MEASUREMENT_ID 환경변수 추가 |

---

## Privacy Considerations

### Data NOT Collected
- 메시지 내용 (텍스트)
- 감정 원시값 (점수)
- 개인 식별 정보 (이름, 이메일 등)
- 민감한 건강 정보

### Data Collected (Anonymized)
- 페이지 방문 빈도
- 기능 사용 패턴 (카테고리만)
- 위기 핫라인 표시/클릭 (안전 메트릭)
- 에러 발생 카테고리

---

## How to Test

### 1. Development Mode (Console Logging)
```bash
npm run dev
```
개발 모드에서는 GA4 호출 대신 콘솔에 로그가 출력됩니다:
```
[Analytics] pageview: { url: '/chat', title: undefined }
[Analytics] event: { action: 'send_message', category: 'chat' }
```

### 2. Production Mode with GA4
1. `.env.local`에 GA4 Measurement ID 설정:
   ```
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

2. 빌드 및 실행:
   ```bash
   npm run build && npm run start
   ```

3. 브라우저 개발자 도구 Network 탭에서 `gtag` 요청 확인

4. GA4 실시간 보고서에서 이벤트 확인

### 3. TypeScript Check
```bash
npx tsc --noEmit
```

### 4. Build Verification
```bash
npm run build
```

---

## Usage Examples

### Basic Event Tracking
```typescript
import { event, trackChatMessage, trackMoodCheckin } from '@/lib/analytics';

// 채팅 메시지 전송 (내용 없이 빈도만)
trackChatMessage();

// 기분 체크인 완료
trackMoodCheckin('good');

// 커스텀 이벤트
event('click', 'button', 'start_chat');
```

### Using ANALYTICS_EVENTS Constants
```typescript
import { ANALYTICS_EVENTS } from '@/lib/constants';
import { event } from '@/lib/analytics';

const { action, category } = ANALYTICS_EVENTS.EXERCISE_STARTED;
event(action, category, 'breathing');
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | GA4 Measurement ID (G-XXXXXXXXXX). 비어있으면 GA4 비활성화 |

---

## Build Verification

```
> npm run build

 ✓ Compiled successfully
 ✓ Linting and checking validity of types ...
 ✓ Generating static pages (10/10)

Route (app)                              Size     First Load JS
┌ ○ /                                    9.24 kB         105 kB
├ ○ /checkin                             4.05 kB        95.2 kB
├ ○ /exercises                           3.92 kB          95 kB
├ ○ /help                                3.01 kB         115 kB
├ ○ /privacy                             2.13 kB         114 kB
├ ○ /profile                             6.17 kB        97.3 kB
└ ○ /settings                            4.65 kB         116 kB
```

---

## Next Steps (Future Enhancements)

1. **이벤트 통합**: 각 컴포넌트에서 실제 이벤트 트래킹 호출 추가
2. **Consent Management**: GDPR/개인정보 동의 배너 구현
3. **Custom Dimensions**: 세션 기반 분석을 위한 커스텀 차원 추가
4. **Enhanced E-commerce**: 프리미엄 기능 도입 시 전환 추적
