'use client';

import { memo, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { EmotionBadge } from '@/components/chat/EmotionBadge';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  emotion?: string;
  isCrisis?: boolean;
  timestamp?: number;
  isTyping?: boolean;
}

export const ChatMessage = memo<ChatMessageProps>(function ChatMessage({
  role,
  content,
  emotion,
  isCrisis,
  timestamp,
  isTyping
}) {
  const isUser = role === 'user';

  // 시간 포맷팅 메모이제이션
  const formattedTime = useMemo(() => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [timestamp]);

  return (
    <div
      className={`
        flex w-full mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300
        ${isUser ? 'justify-end' : 'justify-start'}
      `}
    >
      {/* AI Avatar */}
      {!isUser && (
        <Avatar
          type="ai"
          className="mr-3 mt-1"
          isCrisis={isCrisis}
        />
      )}

      <div className="flex flex-col max-w-[75%] sm:max-w-[70%]">
        {/* Message Bubble */}
        <div
          className={`
            px-4 py-3 shadow-sm transition-all
            ${isUser
              ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-2xl rounded-br-md'
              : 'bg-white text-gray-800 rounded-2xl rounded-bl-md border border-gray-100'
            }
            ${isCrisis && !isUser ? 'border-rose-200 bg-rose-50' : ''}
          `}
        >
          {/* Crisis Warning */}
          {isCrisis && !isUser && (
            <div
              role="alert"
              className="flex items-center gap-2 text-rose-600 text-sm font-semibold mb-2 pb-2 border-b border-rose-100"
            >
              <AlertTriangle size={16} aria-hidden="true" />
              도움이 필요하신 것 같아요
            </div>
          )}

          {/* Message Content */}
          <p
            className={`
              text-[15px] leading-relaxed whitespace-pre-wrap
              ${isTyping ? 'animate-pulse' : ''}
            `}
          >
            {isTyping ? (
              <span className="inline-flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              </span>
            ) : (
              content
            )}
          </p>
        </div>

        {/* Metadata Row */}
        <div
          className={`
            flex items-center gap-2 mt-1.5 px-1
            ${isUser ? 'justify-end' : 'justify-start'}
          `}
        >
          {/* Emotion Badge */}
          {emotion && !isUser && <EmotionBadge emotion={emotion} />}

          {/* Timestamp */}
          {formattedTime && (
            <time
              dateTime={timestamp ? new Date(timestamp).toISOString() : undefined}
              className="text-xs text-gray-400"
            >
              {formattedTime}
            </time>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <Avatar type="user" className="ml-3 mt-1" />
      )}
    </div>
  );
});
