'use client';

import Link from 'next/link';
import { ChevronLeft, Shield } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useTheme } from '@/hooks';

/**
 * 개인정보처리방침 페이지
 * 법적 요구사항에 따른 개인정보 처리 안내
 */
export default function PrivacyPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <AppShell>
      <div className={`flex-1 flex flex-col overflow-y-auto ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Header */}
        <header className={`sticky top-0 z-10 px-4 py-4 border-b ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              aria-label="뒤로 가기"
            >
              <ChevronLeft size={24} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
            </Link>
            <div className="flex items-center gap-2">
              <Shield size={24} className="text-brand-500" />
              <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                개인정보처리방침
              </h1>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 pb-8">
          <article className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className={`prose max-w-none ${isDark ? 'prose-invert' : ''}`}>
              {/* 수집하는 개인정보 항목 */}
              <section className="mb-8">
                <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  1. 수집하는 개인정보 항목
                </h2>
                <p className={`mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  MindBridge는 서비스 제공을 위해 최소한의 정보만 수집합니다.
                </p>
                <ul className={`list-disc list-inside space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>
                    <strong>익명 식별자</strong>: 기기 ID(device_id), 사용자 ID(user_id)
                    <p className={`ml-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      개인을 특정할 수 없는 무작위 생성 값입니다.
                    </p>
                  </li>
                  <li>
                    <strong>대화 내용</strong>: 상담 채팅 기록
                    <p className={`ml-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      서버에 영구 저장되지 않으며, 사용자의 기기(localStorage)에만 저장됩니다.
                    </p>
                  </li>
                  <li>
                    <strong>기분 체크인 데이터</strong>: 감정 상태 및 기록 시간
                    <p className={`ml-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      사용자의 감정 추이를 분석하는 데 사용됩니다.
                    </p>
                  </li>
                </ul>
              </section>

              {/* 개인정보의 이용 목적 */}
              <section className="mb-8">
                <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  2. 개인정보의 이용 목적
                </h2>
                <ul className={`list-disc list-inside space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>
                    <strong>AI 상담 서비스 제공</strong>
                    <p className={`ml-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      사용자의 메시지를 분석하여 맞춤형 상담 응답을 생성합니다.
                    </p>
                  </li>
                  <li>
                    <strong>서비스 개선 및 통계</strong>
                    <p className={`ml-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      익명화된 데이터를 통해 서비스 품질을 향상시킵니다.
                    </p>
                  </li>
                </ul>
              </section>

              {/* 개인정보의 보유 및 파기 */}
              <section className="mb-8">
                <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  3. 개인정보의 보유 및 파기
                </h2>
                <ul className={`list-disc list-inside space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>
                    <strong>localStorage 데이터</strong>
                    <p className={`ml-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      사용자가 직접 삭제하거나 브라우저 데이터를 초기화할 때까지 보관됩니다.
                    </p>
                  </li>
                  <li>
                    <strong>서버 세션 데이터</strong>
                    <p className={`ml-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      세션 종료 시 자동으로 삭제되며, 24시간 이내에 완전히 파기됩니다.
                    </p>
                  </li>
                </ul>
              </section>

              {/* 이용자의 권리 */}
              <section className="mb-8">
                <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  4. 이용자의 권리
                </h2>
                <p className={`mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  사용자는 언제든지 자신의 개인정보에 대해 다음 권리를 행사할 수 있습니다.
                </p>
                <ul className={`list-disc list-inside space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>
                    <strong>데이터 삭제</strong>
                    <p className={`ml-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      설정 &gt; 개인정보 관리에서 모든 대화 기록을 삭제할 수 있습니다.
                    </p>
                  </li>
                  <li>
                    <strong>데이터 내보내기</strong>
                    <p className={`ml-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      설정 &gt; 개인정보 관리에서 JSON 형식으로 데이터를 다운로드할 수 있습니다.
                    </p>
                  </li>
                </ul>
              </section>

              {/* 문의처 */}
              <section className="mb-8">
                <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  5. 문의처
                </h2>
                <p className={`mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  개인정보 처리와 관련된 문의사항이 있으시면 아래로 연락해 주세요.
                </p>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    개인정보 보호 담당자
                  </p>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    이메일: privacy@mindbridge.ai
                  </p>
                </div>
              </section>

              {/* Footer */}
              <footer className={`pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className={`text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  마지막 업데이트: 2026년 1월 18일
                </p>
              </footer>
            </div>
          </article>
        </div>
      </div>
    </AppShell>
  );
}
