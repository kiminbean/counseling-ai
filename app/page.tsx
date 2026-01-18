'use client';

import { AlertCircle, RotateCcw, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/hooks/useChat';
import { AppShell } from '@/components/layout/AppShell';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatSkeleton } from '@/components/common/Skeleton';
import { Sidebar } from '@/components/Sidebar';
import { CrisisAlert } from '@/components/CrisisAlert';

export default function ChatPage() {
  const { isLoading: authLoading, userId } = useAuth();
  const {
    messages,
    isLoading,
    sessionId,
    currentEmotion,
    techniques,
    showCrisisAlert,
    setShowCrisisAlert,
    error,
    clearError,
    sendMessage,
    clearChat,
    messagesEndRef,
  } = useChat();

  // 인증 초기화 중 스켈레톤 표시
  if (authLoading) {
    return (
      <AppShell>
        <div className="flex-1 flex flex-col bg-white">
          <header className="px-4 py-3 border-b border-gray-100">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          </header>
          <ChatSkeleton count={3} />
        </div>
      </AppShell>
    );
  }

  // 사이드바 콘텐츠
  const sidebarContent = (
    <Sidebar currentEmotion={currentEmotion} techniques={techniques} />
  );

  return (
    <AppShell showSidebar sidebarContent={sidebarContent}>
      <div className="flex-1 flex flex-col bg-white lg:rounded-none overflow-hidden">
        {/* Header */}
        <header className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-500 flex items-center justify-center">
              <MessageCircle size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">MindBridge AI</h1>
              <p className="text-xs text-gray-400">
                {sessionId ? `세션: ${sessionId.slice(0, 8)}` : '새 대화'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 현재 감정 표시 (데스크톱에서만) */}
            {currentEmotion && (
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-brand-600 capitalize">
                  {currentEmotion.label}
                </p>
                <p className="text-xs text-gray-400">
                  신뢰도 {Math.round(currentEmotion.confidence * 100)}%
                </p>
              </div>
            )}

            {/* 새 대화 버튼 */}
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="새 대화 시작"
              >
                <RotateCcw size={18} />
              </button>
            )}
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
          {/* Welcome Message */}
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-brand-100 to-brand-200 rounded-full flex items-center justify-center">
                <span className="text-4xl">👋</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                안녕하세요!
              </h2>
              <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
                MindBridge AI입니다.<br />
                편안하게 이야기를 들려주세요.<br />
                여기서 나눈 대화는 안전하게 보호됩니다.
              </p>

              {/* 대화 시작 힌트 */}
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {['요즘 스트레스를 받아요', '기분이 우울해요', '불안해요'].map((hint) => (
                  <button
                    key={hint}
                    onClick={() => sendMessage(hint)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-brand-300 hover:text-brand-600 transition-colors"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              role={msg.role}
              content={msg.content}
              emotion={msg.emotion}
              isCrisis={msg.isCrisis}
              timestamp={msg.timestamp}
            />
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <ChatMessage
              role="assistant"
              content=""
              isTyping
            />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <ChatInput
          onSend={sendMessage}
          isLoading={isLoading}
          disabled={!userId}
        />
      </div>

      {/* Crisis Alert Modal */}
      <CrisisAlert
        isOpen={showCrisisAlert}
        onClose={() => setShowCrisisAlert(false)}
        language="ko"
      />

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">{error}</span>
            <button
              onClick={clearError}
              className="ml-2 text-red-400 hover:text-red-600 font-bold"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
