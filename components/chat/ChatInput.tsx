'use client';

import { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { HOTLINE_SUICIDE, HOTLINE_MENTAL_HEALTH } from '@/lib/constants';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  isLoading = false,
  placeholder = '편안하게 이야기해 주세요...',
  disabled = false
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    if (!value.trim() || isLoading || disabled) return;
    onSend(value.trim());
    setValue('');

    // 높이 초기화
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, isLoading, disabled, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter로 전송 (Shift+Enter는 줄바꿈)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);

    // Auto-resize
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`;
  };

  const canSend = value.trim() && !isLoading && !disabled;

  return (
    <div className="p-4 bg-white border-t border-gray-100">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        {/* 대화 제안 버튼 */}
        <button
          type="button"
          className="p-3 text-gray-400 hover:text-brand-500 hover:bg-brand-50 rounded-xl transition-colors hidden sm:flex"
          title="대화 제안"
          aria-label="AI 대화 제안 보기"
        >
          <Sparkles size={20} aria-hidden="true" />
        </button>

        {/* 입력 필드 */}
        <div className="flex-1 relative">
          <label htmlFor="chat-input" className="sr-only">
            상담 메시지 입력
          </label>
          <textarea
            id="chat-input"
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading || disabled}
            rows={1}
            aria-label="상담 메시지 입력"
            aria-describedby="chat-input-hint"
            className={`
              w-full px-4 py-3
              bg-gray-50 border border-gray-200 rounded-2xl
              resize-none min-h-[48px] max-h-32
              focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500
              transition-all duration-200
              placeholder:text-gray-400
              ${(isLoading || disabled) ? 'opacity-60 cursor-not-allowed' : ''}
            `}
          />
          <span id="chat-input-hint" className="sr-only">
            Enter 키로 전송, Shift+Enter로 줄바꿈
          </span>
        </div>

        {/* 전송 버튼 */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="메시지 전송"
          className={`
            p-3 rounded-xl transition-all duration-200
            ${canSend
              ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm hover:shadow'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <Send size={20} aria-hidden="true" />
        </button>
      </div>

      {/* 안전 정보 */}
      <p className="text-center text-xs text-gray-400 mt-3">
        긴급 상황 시{' '}
        <a href={`tel:${HOTLINE_SUICIDE}`} className="text-brand-600 hover:underline">{HOTLINE_SUICIDE}</a>
        (자살예방) 또는{' '}
        <a href={`tel:${HOTLINE_MENTAL_HEALTH}`} className="text-brand-600 hover:underline">{HOTLINE_MENTAL_HEALTH}</a>
        (정신건강) 연락
      </p>
    </div>
  );
}
