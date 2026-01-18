'use client';

import { useState, useCallback } from 'react';
import { Sun, Moon, Monitor, Bell, BellOff, Volume2, VolumeX, Trash2, Download, Smartphone, Info, ChevronLeft, ChevronRight, Shield, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useTheme } from '@/hooks';
import { usePWA } from '@/hooks';
import { useLocalStorage } from '@/hooks';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { PushNotificationButton } from '@/components/common/PushNotificationButton';
import { APP_CONFIG } from '@/lib/constants';

type NotificationSettings = {
  push: boolean;
  sound: boolean;
};

/**
 * 설정 페이지
 * - 테마 설정 (Light/Dark/System)
 * - 알림 설정 (Push, 소리)
 * - 개인정보 관리 (대화 기록 삭제, 데이터 내보내기)
 * - 앱 정보 (버전, PWA 설치)
 */
export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { isInstallable, isInstalled, promptInstall, isIOS } = usePWA();
  const { isSupported: isPushSupported, permission: pushPermission } = usePushNotifications();
  const [notifications, setNotifications] = useLocalStorage<NotificationSettings>('notification_settings', {
    push: true,
    sound: true,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // 대화 기록 삭제
  const handleDeleteData = useCallback(() => {
    // 대화 관련 localStorage 항목 삭제
    const keysToRemove = ['chat_messages', 'mood_history', 'session_data'];
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    setShowDeleteConfirm(false);
    setDeleteSuccess(true);
    setTimeout(() => setDeleteSuccess(false), 3000);
  }, []);

  // 데이터 내보내기
  const handleExportData = useCallback(() => {
    const exportData: Record<string, unknown> = {};

    // 내보낼 데이터 키 목록
    const keysToExport = ['chat_messages', 'mood_history', 'user_id', 'notification_settings'];

    keysToExport.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          exportData[key] = JSON.parse(value);
        } catch {
          exportData[key] = value;
        }
      }
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindbridge_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // PWA 설치 핸들러
  const handleInstall = async () => {
    if (isInstallable) {
      await promptInstall();
    }
  };

  const themeOptions = [
    { value: 'light' as const, label: '라이트', icon: Sun },
    { value: 'dark' as const, label: '다크', icon: Moon },
    { value: 'system' as const, label: '시스템', icon: Monitor },
  ];

  return (
    <AppShell>
      <div className={`flex-1 flex flex-col overflow-y-auto ${resolvedTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Header */}
        <header className={`sticky top-0 z-10 px-4 py-4 border-b ${resolvedTheme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className={`p-2 rounded-lg ${resolvedTheme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              aria-label="뒤로 가기"
            >
              <ChevronLeft size={24} className={resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} />
            </Link>
            <h1 className={`text-xl font-bold ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              설정
            </h1>
          </div>
        </header>

        <div className="p-4 space-y-6">
          {/* 테마 설정 */}
          <section className={`rounded-2xl p-4 ${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h2 className={`text-lg font-semibold mb-4 ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              테마 설정
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                    theme === value
                      ? 'bg-brand-500 text-white'
                      : resolvedTheme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  aria-pressed={theme === value}
                >
                  <Icon size={24} />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* 알림 설정 */}
          <section className={`rounded-2xl p-4 ${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h2 className={`text-lg font-semibold mb-4 ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              알림 설정
            </h2>
            <div className="space-y-4">
              {/* 브라우저 푸시 알림 (실제 권한 요청) */}
              {isPushSupported && (
                <div className={`p-4 rounded-xl ${resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {pushPermission === 'granted' ? (
                        <Bell size={20} className="text-green-500" />
                      ) : pushPermission === 'denied' ? (
                        <BellOff size={20} className="text-red-500" />
                      ) : (
                        <Bell size={20} className="text-brand-500" />
                      )}
                      <div>
                        <p className={`font-medium ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          브라우저 푸시 알림
                        </p>
                        <p className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          앱이 꺼져있어도 알림 수신
                        </p>
                      </div>
                    </div>
                    <PushNotificationButton compact={false} />
                  </div>
                  {/* 권한 상태 안내 메시지 */}
                  {pushPermission === 'denied' && (
                    <p className={`text-sm mt-2 ${resolvedTheme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                      브라우저 설정에서 알림 권한을 허용해주세요.
                    </p>
                  )}
                  {pushPermission === 'granted' && (
                    <p className={`text-sm mt-2 ${resolvedTheme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                      푸시 알림이 활성화되었습니다.
                    </p>
                  )}
                </div>
              )}

              {/* 인앱 알림 (localStorage 기반) */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {notifications.push ? (
                    <Bell size={20} className="text-brand-500" />
                  ) : (
                    <BellOff size={20} className={resolvedTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'} />
                  )}
                  <div>
                    <p className={`font-medium ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      인앱 알림
                    </p>
                    <p className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      상담 알림 및 리마인더 표시
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, push: !notifications.push })}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    notifications.push ? 'bg-brand-500' : resolvedTheme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                  }`}
                  role="switch"
                  aria-checked={notifications.push}
                >
                  <span
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      notifications.push ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>

              {/* 소리 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {notifications.sound ? (
                    <Volume2 size={20} className="text-brand-500" />
                  ) : (
                    <VolumeX size={20} className={resolvedTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'} />
                  )}
                  <div>
                    <p className={`font-medium ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      소리
                    </p>
                    <p className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      알림 소리 재생
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, sound: !notifications.sound })}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    notifications.sound ? 'bg-brand-500' : resolvedTheme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                  }`}
                  role="switch"
                  aria-checked={notifications.sound}
                >
                  <span
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      notifications.sound ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* 개인정보 관리 */}
          <section className={`rounded-2xl p-4 ${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h2 className={`text-lg font-semibold mb-4 ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              개인정보 관리
            </h2>
            <div className="space-y-3">
              {/* 대화 기록 삭제 */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl transition-colors ${
                  resolvedTheme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <Trash2 size={20} className="text-red-500" />
                <div className="text-left">
                  <p className={`font-medium ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    대화 기록 삭제
                  </p>
                  <p className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    저장된 상담 내역을 삭제합니다
                  </p>
                </div>
              </button>

              {/* 데이터 내보내기 */}
              <button
                onClick={handleExportData}
                className={`w-full flex items-center gap-3 p-4 rounded-xl transition-colors ${
                  resolvedTheme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <Download size={20} className="text-brand-500" />
                <div className="text-left">
                  <p className={`font-medium ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    데이터 내보내기
                  </p>
                  <p className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    JSON 형식으로 다운로드
                  </p>
                </div>
              </button>
            </div>

            {/* 삭제 성공 메시지 */}
            {deleteSuccess && (
              <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm text-center">
                대화 기록이 삭제되었습니다.
              </div>
            )}
          </section>

          {/* 앱 정보 */}
          <section className={`rounded-2xl p-4 ${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h2 className={`text-lg font-semibold mb-4 ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              앱 정보
            </h2>
            <div className="space-y-3">
              {/* 버전 정보 */}
              <div className={`flex items-center justify-between p-4 rounded-xl ${
                resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-3">
                  <Info size={20} className="text-brand-500" />
                  <span className={resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}>버전</span>
                </div>
                <span className={resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                  v{APP_CONFIG.version}
                </span>
              </div>

              {/* 개인정보처리방침 */}
              <Link
                href="/privacy"
                className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                  resolvedTheme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-brand-500" />
                  <span className={resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}>개인정보처리방침</span>
                </div>
                <ChevronRight size={20} className={resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
              </Link>

              {/* 도움말 */}
              <Link
                href="/help"
                className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                  resolvedTheme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <HelpCircle size={20} className="text-brand-500" />
                  <span className={resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}>도움말</span>
                </div>
                <ChevronRight size={20} className={resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
              </Link>

              {/* PWA 설치 */}
              {!isInstalled && (
                <div className={`p-4 rounded-xl ${resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <Smartphone size={20} className="text-brand-500" />
                    <span className={`font-medium ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      앱 설치
                    </span>
                  </div>
                  {isIOS ? (
                    <div className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      <p className="mb-2">iOS에서 앱을 설치하려면:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Safari 하단의 공유 버튼을 탭</li>
                        <li>&quot;홈 화면에 추가&quot; 선택</li>
                      </ol>
                    </div>
                  ) : isInstallable ? (
                    <button
                      onClick={handleInstall}
                      className="w-full py-2 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 transition-colors"
                    >
                      홈 화면에 추가
                    </button>
                  ) : (
                    <p className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Chrome 또는 Edge 브라우저에서 앱을 설치할 수 있습니다.
                    </p>
                  )}
                </div>
              )}

              {isInstalled && (
                <div className={`flex items-center gap-3 p-4 rounded-xl ${
                  resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <Smartphone size={20} className="text-green-500" />
                  <span className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    앱이 설치되어 있습니다
                  </span>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* 삭제 확인 모달 */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className={`w-full max-w-sm rounded-2xl p-6 ${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`text-lg font-semibold mb-2 ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                대화 기록 삭제
              </h3>
              <p className={`mb-6 ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                모든 대화 기록이 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className={`flex-1 py-3 rounded-xl font-medium ${
                    resolvedTheme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  취소
                </button>
                <button
                  onClick={handleDeleteData}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
