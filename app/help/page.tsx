'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, HelpCircle, ChevronDown, ChevronUp, MessageCircle, Smile, Activity, Mail, Phone } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useTheme } from '@/hooks';

type FAQItem = {
  question: string;
  answer: string;
};

const faqItems: FAQItem[] = [
  {
    question: '대화 내용은 안전한가요?',
    answer: '모든 대화는 암호화되며, 서버에 영구 저장되지 않습니다. 대화 내용은 사용자의 기기(localStorage)에만 저장되며, 설정에서 언제든지 삭제할 수 있습니다.',
  },
  {
    question: 'AI가 진짜 상담사인가요?',
    answer: '아니요, MindBridge는 AI 챗봇입니다. 전문적인 심리상담이나 치료가 필요한 경우, 자살예방상담전화 1393번 또는 정신건강위기상담전화 1577-0199번에 연락해 주세요.',
  },
  {
    question: '데이터를 삭제하려면?',
    answer: '설정 > 개인정보 관리에서 "대화 기록 삭제" 버튼을 클릭하면 모든 상담 내역을 삭제할 수 있습니다. 삭제된 데이터는 복구할 수 없습니다.',
  },
  {
    question: '오프라인에서도 사용 가능한가요?',
    answer: '기본적인 UI와 저장된 대화 기록은 오프라인에서도 확인할 수 있습니다. 다만, AI 상담 기능은 인터넷 연결이 필요합니다.',
  },
];

/**
 * 도움말 페이지
 * 사용 가이드, FAQ, 문의 정보 제공
 */
export default function HelpPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

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
              <HelpCircle size={24} className="text-brand-500" />
              <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                도움말
              </h1>
            </div>
          </div>
        </header>

        <div className="p-4 pb-8 space-y-6">
          {/* 사용 가이드 */}
          <section className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              사용 가이드
            </h2>
            <div className="space-y-4">
              {/* 채팅 시작하기 */}
              <div className={`flex items-start gap-4 p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="p-2 bg-brand-100 rounded-lg">
                  <MessageCircle size={20} className="text-brand-600" />
                </div>
                <div>
                  <h3 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    채팅 시작하기
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    메인 화면에서 원하는 주제를 선택하거나, 자유롭게 메시지를 입력하여 AI 상담을 시작하세요.
                    마음 편하게 이야기해도 됩니다.
                  </p>
                </div>
              </div>

              {/* 기분 체크인 사용법 */}
              <div className={`flex items-start gap-4 p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Smile size={20} className="text-yellow-600" />
                </div>
                <div>
                  <h3 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    기분 체크인 사용법
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    매일 기분 체크인을 통해 감정 상태를 기록하세요. 시간이 지나면 감정 추이를 확인할 수 있어
                    자기 이해에 도움이 됩니다.
                  </p>
                </div>
              </div>

              {/* 심리 운동 활용하기 */}
              <div className={`flex items-start gap-4 p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity size={20} className="text-green-600" />
                </div>
                <div>
                  <h3 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    심리 운동 활용하기
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    호흡 운동, 근육 이완 등 다양한 심리 운동을 통해 스트레스를 해소하고 마음의 안정을 찾으세요.
                    정기적인 연습이 효과적입니다.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 자주 묻는 질문 (FAQ) */}
          <section className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              자주 묻는 질문
            </h2>
            <div className="space-y-2">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className={`rounded-xl overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                      isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                    }`}
                    aria-expanded={openFAQ === index}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span className={`font-medium pr-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Q. {item.question}
                    </span>
                    {openFAQ === index ? (
                      <ChevronUp size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    ) : (
                      <ChevronDown size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    )}
                  </button>
                  {openFAQ === index && (
                    <div
                      id={`faq-answer-${index}`}
                      className={`px-4 pb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                    >
                      <p className="text-sm leading-relaxed">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 문의하기 */}
          <section className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              문의하기
            </h2>
            <div className="space-y-4">
              {/* 이메일 */}
              <div className={`flex items-center gap-4 p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    이메일 문의
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    support@mindbridge.ai
                  </p>
                </div>
              </div>

              {/* 긴급 상담 */}
              <div className={`p-4 rounded-xl border-2 ${isDark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Phone size={20} className="text-red-600" />
                  </div>
                  <p className={`font-semibold ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                    긴급 상담 안내
                  </p>
                </div>
                <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  심각한 위기 상황이거나 전문 상담이 필요한 경우, 아래 전화번호로 연락해 주세요.
                </p>
                <div className="space-y-2">
                  <div className={`flex justify-between items-center p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      자살예방상담전화
                    </span>
                    <a
                      href="tel:1393"
                      className="font-bold text-brand-600 hover:text-brand-700"
                    >
                      1393
                    </a>
                  </div>
                  <div className={`flex justify-between items-center p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      정신건강위기상담전화
                    </span>
                    <a
                      href="tel:1577-0199"
                      className="font-bold text-brand-600 hover:text-brand-700"
                    >
                      1577-0199
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
