/**
 * Push Notifications Utility
 * 저장 경로: frontend/lib/pushNotifications.ts
 *
 * Firebase Cloud Messaging (FCM) 클라이언트 연동
 * - FCM 토큰 관리
 * - 알림 권한 요청
 * - 포그라운드 메시지 핸들링
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getMessaging,
  getToken,
  onMessage,
  Messaging,
  MessagePayload,
} from 'firebase/messaging';

// Firebase 설정 (환경 변수에서 로드)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// localStorage 키
const FCM_TOKEN_KEY = 'fcm_token';
const FCM_TOKEN_TIMESTAMP_KEY = 'fcm_token_timestamp';

// 토큰 갱신 주기 (7일, ms 단위)
const TOKEN_REFRESH_INTERVAL = 7 * 24 * 60 * 60 * 1000;

// API 베이스 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Firebase 앱 및 메시징 인스턴스 (싱글톤)
let firebaseApp: FirebaseApp | null = null;
let messaging: Messaging | null = null;

/**
 * Firebase 설정이 유효한지 확인
 */
export function isFirebaseConfigured(): boolean {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
}

/**
 * 브라우저 환경인지 확인
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Push 알림이 지원되는 환경인지 확인
 */
export function isPushSupported(): boolean {
  if (!isBrowser()) return false;
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Firebase 앱 초기화
 */
function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) {
    console.warn('[Push] Firebase config is not set. Push notifications are disabled.');
    return null;
  }

  if (!firebaseApp) {
    // 이미 초기화된 앱이 있는지 확인
    const existingApps = getApps();
    if (existingApps.length > 0) {
      firebaseApp = existingApps[0];
    } else {
      firebaseApp = initializeApp(firebaseConfig);
    }
  }

  return firebaseApp;
}

/**
 * Firebase Messaging 초기화
 * @returns Messaging 인스턴스 또는 null (미지원 환경)
 */
export function initializeFirebaseMessaging(): Messaging | null {
  if (!isBrowser()) {
    console.warn('[Push] Cannot initialize messaging in server environment.');
    return null;
  }

  if (!isPushSupported()) {
    console.warn('[Push] Push notifications are not supported in this browser.');
    return null;
  }

  if (messaging) {
    return messaging;
  }

  const app = getFirebaseApp();
  if (!app) {
    return null;
  }

  try {
    messaging = getMessaging(app);
    console.log('[Push] Firebase Messaging initialized successfully.');
    return messaging;
  } catch (error) {
    console.error('[Push] Failed to initialize Firebase Messaging:', error);
    return null;
  }
}

/**
 * 알림 권한 요청
 * @returns 권한 상태 ('granted' | 'denied' | 'default')
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isBrowser()) {
    return 'default';
  }

  if (!('Notification' in window)) {
    console.warn('[Push] Notifications are not supported.');
    return 'denied';
  }

  // 이미 권한이 결정된 경우
  if (Notification.permission !== 'default') {
    return Notification.permission;
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('[Push] Notification permission:', permission);
    return permission;
  } catch (error) {
    console.error('[Push] Failed to request notification permission:', error);
    return 'denied';
  }
}

/**
 * 현재 알림 권한 상태 조회
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isBrowser() || !('Notification' in window)) {
    return 'default';
  }
  return Notification.permission;
}

/**
 * FCM 토큰 획득
 * @returns FCM 토큰 또는 null
 */
export async function getFCMToken(): Promise<string | null> {
  const fcmMessaging = initializeFirebaseMessaging();
  if (!fcmMessaging) {
    return null;
  }

  // 알림 권한 확인
  if (Notification.permission !== 'granted') {
    console.warn('[Push] Notification permission not granted.');
    return null;
  }

  try {
    // Service Worker 등록 확인
    const swRegistration = await navigator.serviceWorker.ready;

    // VAPID 키 (Firebase 콘솔에서 발급)
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

    const token = await getToken(fcmMessaging, {
      vapidKey: vapidKey,
      serviceWorkerRegistration: swRegistration,
    });

    if (token) {
      console.log('[Push] FCM token acquired.');

      // 토큰 변경 감지 및 캐시
      const cachedToken = getCachedToken();
      if (token !== cachedToken) {
        cacheToken(token);
        console.log('[Push] FCM token updated.');
      }

      return token;
    } else {
      console.warn('[Push] Failed to get FCM token - no token returned.');
      return null;
    }
  } catch (error) {
    console.error('[Push] Failed to get FCM token:', error);
    return null;
  }
}

/**
 * 캐시된 토큰 조회
 */
export function getCachedToken(): string | null {
  if (!isBrowser()) return null;

  try {
    return localStorage.getItem(FCM_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * 토큰 캐시에 저장
 */
function cacheToken(token: string): void {
  if (!isBrowser()) return;

  try {
    localStorage.setItem(FCM_TOKEN_KEY, token);
    localStorage.setItem(FCM_TOKEN_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.warn('[Push] Failed to cache token:', error);
  }
}

/**
 * 캐시된 토큰이 갱신 필요한지 확인
 */
export function isTokenRefreshNeeded(): boolean {
  if (!isBrowser()) return false;

  try {
    const timestamp = localStorage.getItem(FCM_TOKEN_TIMESTAMP_KEY);
    if (!timestamp) return true;

    const elapsed = Date.now() - parseInt(timestamp, 10);
    return elapsed > TOKEN_REFRESH_INTERVAL;
  } catch {
    return true;
  }
}

/**
 * 캐시된 토큰 삭제
 */
export function clearCachedToken(): void {
  if (!isBrowser()) return;

  try {
    localStorage.removeItem(FCM_TOKEN_KEY);
    localStorage.removeItem(FCM_TOKEN_TIMESTAMP_KEY);
  } catch {
    // 무시
  }
}

/**
 * 포그라운드 메시지 수신 핸들러 등록
 * @param callback 메시지 수신 시 호출될 콜백
 * @returns 구독 해제 함수 또는 null
 */
export function onMessageReceived(
  callback: (payload: MessagePayload) => void
): (() => void) | null {
  const fcmMessaging = initializeFirebaseMessaging();
  if (!fcmMessaging) {
    return null;
  }

  const unsubscribe = onMessage(fcmMessaging, (payload) => {
    console.log('[Push] Foreground message received:', payload);
    callback(payload);
  });

  return unsubscribe;
}

/**
 * FCM 토큰을 서버에 저장
 * @param token FCM 토큰
 * @param userId 사용자 ID (선택)
 * @returns 성공 여부
 */
export async function saveFCMTokenToServer(
  token: string,
  userId?: string
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v3/push/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        platform: 'web',
        user_id: userId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Push] Failed to save token to server:', response.status, errorText);
      return false;
    }

    console.log('[Push] Token saved to server successfully.');
    return true;
  } catch (error) {
    console.error('[Push] Failed to save token to server:', error);
    return false;
  }
}

/**
 * FCM 토큰 서버에서 삭제 (로그아웃 시 등)
 * @param token FCM 토큰
 * @returns 성공 여부
 */
export async function removeFCMTokenFromServer(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v3/push/unregister`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      console.error('[Push] Failed to remove token from server:', response.status);
      return false;
    }

    clearCachedToken();
    console.log('[Push] Token removed from server successfully.');
    return true;
  } catch (error) {
    console.error('[Push] Failed to remove token from server:', error);
    return false;
  }
}

/**
 * 푸시 알림 전체 초기화 및 토큰 획득
 * (권한 요청 -> 토큰 획득 -> 서버 저장)
 * @param userId 사용자 ID (선택)
 * @returns FCM 토큰 또는 null
 */
export async function initializePushNotifications(
  userId?: string
): Promise<string | null> {
  // 1. 지원 환경 확인
  if (!isPushSupported()) {
    console.warn('[Push] Push notifications are not supported.');
    return null;
  }

  // 2. Firebase 설정 확인
  if (!isFirebaseConfigured()) {
    console.warn('[Push] Firebase is not configured.');
    return null;
  }

  // 3. 알림 권한 요청
  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    console.warn('[Push] Notification permission denied.');
    return null;
  }

  // 4. FCM 토큰 획득
  const token = await getFCMToken();
  if (!token) {
    return null;
  }

  // 5. 서버에 토큰 저장
  await saveFCMTokenToServer(token, userId);

  return token;
}
