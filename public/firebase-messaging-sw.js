/**
 * Firebase Messaging Service Worker
 * 저장 경로: frontend/public/firebase-messaging-sw.js
 *
 * 백그라운드 푸시 알림 수신 및 처리
 * - Firebase Cloud Messaging (FCM) 연동
 * - 백그라운드 메시지 핸들러
 * - 알림 클릭 핸들러
 */

// Firebase compat SDK 사용 (Service Worker에서 필요)
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

/**
 * Firebase 설정
 *
 * 주의: Service Worker에서는 환경 변수를 사용할 수 없습니다.
 * 프로덕션 환경에서는 아래 중 하나의 방법으로 설정하세요:
 *
 * 1. 빌드 스크립트에서 환경 변수 주입
 * 2. 서버에서 동적으로 설정 로드 (권장하지 않음 - SW 초기화 지연)
 * 3. CI/CD 파이프라인에서 placeholder 교체
 *
 * 아래 값들을 Firebase Console > 프로젝트 설정 > 일반에서 확인하여 교체하세요.
 */
const firebaseConfig = {
  apiKey: 'YOUR_FIREBASE_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// Messaging 인스턴스 획득
const messaging = firebase.messaging();

/**
 * 백그라운드 메시지 핸들러
 *
 * 앱이 백그라운드 또는 종료 상태일 때 푸시 메시지 수신
 *
 * payload 구조:
 * {
 *   notification: { title, body, image },
 *   data: { url, tag, ... }
 * }
 */
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw] Background message received:', payload);

  // 알림 제목 및 옵션 설정
  const notificationTitle = payload.notification?.title || 'MindBridge AI';
  const notificationOptions = {
    body: payload.notification?.body || '새로운 메시지가 있습니다.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: payload.data?.tag || 'mindbridge-notification',
    data: {
      url: payload.data?.url || '/',
      ...payload.data,
    },
    // 재알림 허용 (같은 tag 알림 업데이트)
    renotify: true,
    // 알림 자동 닫기 비활성화
    requireInteraction: false,
    // 무음 모드에서도 진동
    vibrate: [100, 50, 100],
    // 알림 액션 버튼
    actions: [
      {
        action: 'open',
        title: '열기',
      },
      {
        action: 'close',
        title: '닫기',
      },
    ],
  };

  // 알림 표시
  self.registration.showNotification(notificationTitle, notificationOptions);
});

/**
 * 알림 클릭 핸들러
 *
 * 사용자가 알림을 클릭했을 때 처리:
 * 1. 알림 닫기
 * 2. 앱이 열려있으면 포커스
 * 3. 앱이 닫혀있으면 새 창 열기
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw] Notification clicked:', event);

  // 알림 닫기
  event.notification.close();

  // '닫기' 액션 클릭 시 아무것도 하지 않음
  if (event.action === 'close') {
    return;
  }

  // 열 URL 결정
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then((windowClients) => {
        // 이미 열려있는 앱 창 찾기
        for (const client of windowClients) {
          // 같은 origin의 창이면 포커스
          if (new URL(client.url).origin === self.location.origin && 'focus' in client) {
            // URL이 다르면 네비게이트
            if (client.url !== urlToOpen) {
              client.navigate(urlToOpen);
            }
            return client.focus();
          }
        }

        // 열려있는 창이 없으면 새 창 열기
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

/**
 * 알림 닫기 핸들러
 *
 * 사용자가 알림을 닫았을 때 (선택적 분석용)
 */
self.addEventListener('notificationclose', (event) => {
  console.log('[firebase-messaging-sw] Notification closed:', event);
  // 분석 이벤트 전송 등 추가 처리 가능
});

console.log('[firebase-messaging-sw] Firebase Messaging Service Worker loaded');
