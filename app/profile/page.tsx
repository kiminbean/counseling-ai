'use client';

import Link from 'next/link';
import { User, Settings, Shield, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AppShell } from '@/components/layout/AppShell';
import { APP_CONFIG, HOTLINE_SUICIDE, HOTLINE_MENTAL_HEALTH } from '@/lib/constants';

export default function ProfilePage() {
  const { userId, anonymousId, logout } = useAuth();

  const menuItems = [
    {
      icon: Settings,
      label: '설정',
      description: '알림, 언어, 테마',
      href: '/settings',
    },
    {
      icon: Shield,
      label: '개인정보 보호',
      description: '데이터 관리 및 보안',
      comingSoon: true,
    },
    {
      icon: HelpCircle,
      label: '도움말',
      description: 'FAQ 및 지원',
      comingSoon: true,
    },
  ];

  return (
    <AppShell>
      <div className="flex-1 flex flex-col bg-white overflow-y-auto">
        {/* Header */}
        <header className="px-4 py-6 bg-gradient-to-br from-brand-500 to-brand-600 text-white">
          <h1 className="text-xl font-bold mb-4">프로필</h1>

          {/* User Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <User size={32} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-lg">익명 사용자</p>
                <p className="text-sm text-white/70">
                  ID: {userId?.slice(0, 12) || anonymousId?.slice(0, 12) || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Menu */}
        <div className="p-4 space-y-2">
          {menuItems.map((item) => {
            const content = (
              <>
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                  <item.icon size={20} className="text-brand-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-800">{item.label}</p>
                    {item.comingSoon && (
                      <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-500 rounded-full">
                        준비 중
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </>
            );

            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-xl text-left hover:bg-gray-100 cursor-pointer"
                >
                  {content}
                </Link>
              );
            }

            return (
              <div
                key={item.label}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-xl text-left opacity-60 cursor-not-allowed"
              >
                {content}
              </div>
            );
          })}
        </div>

        {/* Version Info */}
        <div className="p-4 mt-auto">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-500">{APP_CONFIG.name}</p>
            <p className="text-xs text-gray-400">Version {APP_CONFIG.version}</p>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full mt-4 flex items-center justify-center gap-2 p-4 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">로그아웃</span>
          </button>
        </div>

        {/* Safety Info */}
        <div className="p-4 bg-amber-50 border-t border-amber-100">
          <p className="text-sm text-amber-800 text-center">
            긴급 상황 시{' '}
            <a href={`tel:${HOTLINE_SUICIDE}`} className="font-semibold underline">{HOTLINE_SUICIDE}</a>
            (자살예방) 또는{' '}
            <a href={`tel:${HOTLINE_MENTAL_HEALTH}`} className="font-semibold underline">{HOTLINE_MENTAL_HEALTH}</a>
            (정신건강)로 연락하세요.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
