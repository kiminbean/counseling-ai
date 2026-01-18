/**
 * Crisis Alert Modal
 * 저장 경로: frontend/components/CrisisAlert.tsx
 *
 * 위기 상황 감지 시 표시되는 알림 모달
 */
'use client';

import { Phone, X, Heart, ExternalLink } from 'lucide-react';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface CrisisAlertProps {
  isOpen: boolean;
  onClose: () => void;
  language?: string;
}

interface HotlineInfo {
  name: string;
  number: string;
  hours: string;
  url?: string;
}

const HOTLINES: Record<string, HotlineInfo[]> = {
  ko: [
    {
      name: '자살예방상담전화',
      number: '1393',
      hours: '24시간',
      url: 'https://www.129.go.kr'
    },
    {
      name: '정신건강위기상담전화',
      number: '1577-0199',
      hours: '24시간',
      url: 'https://www.mentalhealth.go.kr'
    },
    {
      name: '생명의전화',
      number: '1588-9191',
      hours: '24시간',
    },
  ],
  en: [
    {
      name: '988 Suicide & Crisis Lifeline',
      number: '988',
      hours: '24/7',
      url: 'https://988lifeline.org'
    },
    {
      name: 'Crisis Text Line',
      number: 'Text HOME to 741741',
      hours: '24/7',
      url: 'https://www.crisistextline.org'
    },
  ],
};

const MESSAGES = {
  ko: {
    title: '도움이 필요하신가요?',
    subtitle: '지금 힘든 상황이시라면, 전문 상담사가 도움을 드릴 수 있어요.',
    helpMessage: '혼자 감당하지 않으셔도 됩니다.',
    callButton: '전화하기',
    continueButton: '대화 계속하기',
    emergencyNote: '긴급 상황 시 119에 연락하세요.',
  },
  en: {
    title: 'Need Help?',
    subtitle: "If you're going through a difficult time, professional counselors are here to help.",
    helpMessage: "You don't have to face this alone.",
    callButton: 'Call Now',
    continueButton: 'Continue Chat',
    emergencyNote: 'In case of emergency, call 911.',
  },
};

export function CrisisAlert({ isOpen, onClose, language = 'ko' }: CrisisAlertProps) {
  const modalRef = useFocusTrap<HTMLDivElement>({
    isActive: isOpen,
    onEscape: onClose,
  });

  if (!isOpen) return null;

  const hotlines = HOTLINES[language] || HOTLINES.en;
  const messages = MESSAGES[language as keyof typeof MESSAGES] || MESSAGES.en;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="crisis-alert-title"
      aria-describedby="crisis-alert-description"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-6 text-white">
          <button
            onClick={onClose}
            aria-label="닫기"
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={20} aria-hidden="true" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <Heart className="w-8 h-8" fill="currentColor" aria-hidden="true" />
            <h2 id="crisis-alert-title" className="text-xl font-bold">{messages.title}</h2>
          </div>
          <p id="crisis-alert-description" className="text-white/90 text-sm">{messages.subtitle}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-center text-gray-600 font-medium">
            {messages.helpMessage}
          </p>

          {/* Hotlines */}
          <div className="space-y-3">
            {hotlines.map((hotline, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div>
                  <p className="font-semibold text-gray-800">{hotline.name}</p>
                  <p className="text-sm text-gray-500">{hotline.hours}</p>
                </div>
                <a
                  href={`tel:${hotline.number.replace(/\s+/g, '')}`}
                  aria-label={`${hotline.name}에 전화하기: ${hotline.number}`}
                  className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors"
                >
                  <Phone size={16} aria-hidden="true" />
                  <span className="font-medium">{hotline.number}</span>
                </a>
              </div>
            ))}
          </div>

          {/* Additional Resources */}
          {hotlines.some(h => h.url) && (
            <div className="pt-2">
              <p className="text-xs text-gray-400 mb-2">추가 정보:</p>
              <div className="flex flex-wrap gap-2">
                {hotlines
                  .filter(h => h.url)
                  .map((hotline, index) => (
                    <a
                      key={index}
                      href={hotline.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${hotline.name} 웹사이트 (새 탭에서 열림)`}
                      className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1"
                    >
                      {hotline.name}
                      <ExternalLink size={10} aria-hidden="true" />
                    </a>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex flex-col gap-3">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            {messages.continueButton}
          </button>
          <p className="text-xs text-center text-gray-400">
            {messages.emergencyNote}
          </p>
        </div>
      </div>
    </div>
  );
}
