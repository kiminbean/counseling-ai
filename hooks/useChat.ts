'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { sendMessage as sendMessageApi, getErrorMessage } from '@/lib/api';
import { Message, EmotionData, ChatResponseFormatted } from '@/types';
import { debounce, safeJsonParse } from '@/lib/utils';

// 데모 모드 응답 생성
const DEMO_RESPONSES: Record<string, ChatResponseFormatted> = {
  default: {
    session_id: 'demo_session',
    response: '말씀해 주셔서 감사합니다. 지금 어떤 감정을 느끼고 계신지 더 이야기해 주실 수 있을까요?',
    emotion: { label: 'neutral', confidence: 0.8, intensity: 0.5, secondary: [] },
    is_crisis: false,
    suggested_techniques: ['호흡 운동', '감정 일기'],
  },
  stress: {
    session_id: 'demo_session',
    response: '스트레스를 받고 계시는군요. 요즘 어떤 상황이 가장 힘드신가요? 천천히 말씀해 주세요.',
    emotion: { label: 'stressed', confidence: 0.85, intensity: 0.7, secondary: ['anxious'] },
    is_crisis: false,
    suggested_techniques: ['심호흡', '점진적 근육 이완'],
  },
  sad: {
    session_id: 'demo_session',
    response: '우울하고 힘든 마음이 느껴지네요. 그 감정이 언제부터 시작되었는지 기억나시나요?',
    emotion: { label: 'sad', confidence: 0.9, intensity: 0.6, secondary: ['tired'] },
    is_crisis: false,
    suggested_techniques: ['감정 일기', '산책하기'],
  },
  anxious: {
    session_id: 'demo_session',
    response: '불안한 마음이 드시는군요. 지금 이 순간 깊게 숨을 쉬어볼까요? 함께 천천히 호흡해 보겠습니다.',
    emotion: { label: 'anxious', confidence: 0.88, intensity: 0.65, secondary: ['stressed'] },
    is_crisis: false,
    suggested_techniques: ['4-7-8 호흡법', '마음챙김 명상'],
  },
};

function getDemoResponse(message: string): ChatResponseFormatted {
  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes('스트레스') || lowerMsg.includes('stress')) {
    return DEMO_RESPONSES.stress;
  }
  if (lowerMsg.includes('우울') || lowerMsg.includes('슬프') || lowerMsg.includes('sad')) {
    return DEMO_RESPONSES.sad;
  }
  if (lowerMsg.includes('불안') || lowerMsg.includes('걱정') || lowerMsg.includes('anxious')) {
    return DEMO_RESPONSES.anxious;
  }
  return DEMO_RESPONSES.default;
}

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

    let data: ChatResponseFormatted;

    try {
      data = await sendMessageApi(content, userId, sessionId);
    } catch (err) {
      // API 실패 시 데모 모드로 전환
      console.warn('API unavailable, using demo mode:', err);

      // 데모 응답에 약간의 지연 추가 (자연스러운 UX)
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
      data = getDemoResponse(content);
    }

    try {
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
