'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { sendMessage as sendMessageApi, getErrorMessage } from '@/lib/api';
import { Message, EmotionData } from '@/types';
import { debounce, safeJsonParse } from '@/lib/utils';

// 고유 ID 생성
const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// 저장할 최대 메시지 수
const MAX_STORED_MESSAGES = 50;

// localStorage 저장 딜레이 (ms)
const STORAGE_DEBOUNCE_MS = 1000;

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  sessionId: string | null;
  currentEmotion: EmotionData | null;
  techniques: string[];
  showCrisisAlert: boolean;
  setShowCrisisAlert: (show: boolean) => void;
  error: string | null;
  clearError: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export function useChat(): UseChatReturn {
  const { userId, isAuthenticated, isLoading: authLoading } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionData | null>(null);
  const [techniques, setTechniques] = useState<string[]>([]);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Debounced 저장 함수 (메모이제이션)
  const debouncedSaveMessages = useMemo(
    () =>
      debounce((msgs: Message[]) => {
        if (typeof window === 'undefined') return;
        const messagesToStore = msgs.slice(-MAX_STORED_MESSAGES);
        localStorage.setItem('current_messages', JSON.stringify(messagesToStore));
      }, STORAGE_DEBOUNCE_MS),
    []
  );

  // localStorage에서 세션 복원 (초기 로드 시 1회만)
  useEffect(() => {
    if (typeof window === 'undefined' || authLoading) return;

    const storedSessionId = localStorage.getItem('current_session_id');
    const storedMessages = localStorage.getItem('current_messages');

    if (storedSessionId) {
      setSessionId(storedSessionId);
    }

    if (storedMessages) {
      const parsed = safeJsonParse<Message[]>(storedMessages, []);
      if (parsed.length > 0) {
        setMessages(parsed);
      }
    }
  }, [authLoading]);

  // 세션 ID 저장 (즉시)
  useEffect(() => {
    if (typeof window === 'undefined' || !sessionId) return;
    localStorage.setItem('current_session_id', sessionId);
  }, [sessionId]);

  // 메시지 저장 (debounced)
  useEffect(() => {
    if (messages.length > 0) {
      debouncedSaveMessages(messages);
    }
  }, [messages, debouncedSaveMessages]);

  // 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 메시지 전송
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading || !userId) return;

    const userMsgId = generateId();

    // 낙관적 업데이트
    setMessages(prev => [...prev, {
      id: userMsgId,
      role: 'user',
      content,
      timestamp: Date.now()
    }]);
    setIsLoading(true);
    setError(null);

    try {
      const data = await sendMessageApi(content, userId, sessionId);

      setSessionId(data.session_id);
      setCurrentEmotion(data.emotion);
      setTechniques(data.suggested_techniques || []);

      // 위기 상황 감지
      if (data.is_crisis) {
        setShowCrisisAlert(true);
      }

      // AI 응답 추가
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'assistant',
        content: data.response,
        emotion: data.emotion.label,
        isCrisis: data.is_crisis,
        timestamp: Date.now()
      }]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = getErrorMessage(err, 'ko');
      setError(errorMessage);

      // 낙관적 업데이트 롤백
      setMessages(prev => prev.filter(m => m.id !== userMsgId));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, userId, sessionId]);

  // 채팅 초기화
  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setCurrentEmotion(null);
    setTechniques([]);
    setError(null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('current_session_id');
      localStorage.removeItem('current_messages');
    }
  }, []);

  // 에러 초기화
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
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
  };
}
