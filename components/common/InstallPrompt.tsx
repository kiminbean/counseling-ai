'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { useLocalStorage } from '@/hooks/useLocalStorage';

/**
 * PWA 설치 프롬프트 배너
 *
 * - Android: 네이티브 설치 프롬프트 사용
 * - iOS: Safari 공유 메뉴 안내
 */
export function InstallPrompt() {
  const { isInstallable, isInstalled, promptInstall, isIOS } = usePWA();
  const [dismissed, setDismissed] = useLocalStorage('pwa-install-dismissed', false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // iOS 안내는 별도 처리
  const shouldShowIOSPrompt = isIOS && !isInstalled && !dismissed;
  const shouldShowAndroidPrompt = isInstallable && !dismissed;

  // 이미 설치되었거나 무시했으면 표시 안함
  if (isInstalled || dismissed) return null;
  if (!shouldShowIOSPrompt && !shouldShowAndroidPrompt) return null;

  const handleDismiss = () => {
    setDismissed(true);
  };

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      setDismissed(true);
    }
  };

  // iOS 설치 안내
  if (isIOS) {
    return (
      <>
        <div className="fixed bottom-20 left-4 right-4 z-40 lg:bottom-4 lg:left-auto lg:right-4 lg:max-w-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Download className="w-5 h-5 text-brand-600" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">
                  홈 화면에 추가
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  앱처럼 빠르게 접근하세요
                </p>
              </div>

              <button
                onClick={handleDismiss}
                className="p-1 text-gray-400 hover:text-gray-600"
                aria-label="닫기"
              >
                <X size={18} />
              </button>
            </div>

            <button
              onClick={() => setShowIOSGuide(true)}
              className="w-full mt-3 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-xl hover:bg-brand-600 transition-colors"
            >
              설치 방법 보기
            </button>
          </div>
        </div>

        {/* iOS 설치 가이드 모달 */}
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/50">
            <div className="bg-white rounded-t-3xl w-full max-w-md p-6 animate-slide-in">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">홈 화면에 추가하기</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  aria-label="닫기"
                >
                  <X size={20} />
                </button>
              </div>

              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    1
                  </span>
                  <div>
                    <p className="text-sm text-gray-700">
                      Safari 하단의 <Share className="inline w-4 h-4" /> 공유 버튼을 누르세요
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    2
                  </span>
                  <p className="text-sm text-gray-700">
                    &quot;홈 화면에 추가&quot;를 선택하세요
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    3
                  </span>
                  <p className="text-sm text-gray-700">
                    오른쪽 상단의 &quot;추가&quot;를 누르세요
                  </p>
                </li>
              </ol>

              <button
                onClick={() => {
                  setShowIOSGuide(false);
                  setDismissed(true);
                }}
                className="w-full mt-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Android/Desktop 설치 프롬프트
  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 lg:bottom-4 lg:left-auto lg:right-4 lg:max-w-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-brand-600" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm">
              MindBridge 앱 설치
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              홈 화면에 추가하고 빠르게 접근하세요
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 text-gray-400 hover:text-gray-600"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={handleDismiss}
            className="flex-1 py-2.5 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors"
          >
            나중에
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-xl hover:bg-brand-600 transition-colors"
          >
            설치하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default InstallPrompt;
