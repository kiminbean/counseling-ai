'use client';

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UsePWAReturn {
  /**
   * 설치 가능 여부
   */
  isInstallable: boolean;

  /**
   * 이미 설치됨 (standalone 모드)
   */
  isInstalled: boolean;

  /**
   * 설치 프롬프트 표시
   */
  promptInstall: () => Promise<boolean>;

  /**
   * iOS 디바이스 여부
   */
  isIOS: boolean;

  /**
   * Service Worker 등록 상태
   */
  swRegistered: boolean;
}

/**
 * PWA 설치 및 상태 관리 훅
 *
 * @example
 * ```tsx
 * const { isInstallable, promptInstall, isIOS } = usePWA();
 *
 * if (isInstallable) {
 *   return <button onClick={promptInstall}>앱 설치</button>;
 * }
 * ```
 */
export function usePWA(): UsePWAReturn {
  const [installPromptEvent, setInstallPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [swRegistered, setSwRegistered] = useState(false);

  // 초기화
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // iOS 체크
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(isIOSDevice);

    // standalone 모드 체크 (이미 설치됨)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // beforeinstallprompt 이벤트 리스너
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
    };

    // appinstalled 이벤트 리스너
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPromptEvent(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Service Worker 등록
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered:', registration.scope);
          setSwRegistered(true);

          // 업데이트 체크
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[PWA] New version available');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error);
        });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // 설치 프롬프트 표시
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!installPromptEvent) {
      console.log('[PWA] No install prompt available');
      return false;
    }

    try {
      await installPromptEvent.prompt();
      const { outcome } = await installPromptEvent.userChoice;
      console.log('[PWA] Install prompt result:', outcome);

      if (outcome === 'accepted') {
        setInstallPromptEvent(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[PWA] Install prompt error:', error);
      return false;
    }
  }, [installPromptEvent]);

  return {
    isInstallable: !!installPromptEvent && !isInstalled,
    isInstalled,
    promptInstall,
    isIOS,
    swRegistered,
  };
}

export default usePWA;
